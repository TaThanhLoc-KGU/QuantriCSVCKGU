package com.ttloc.qtcsvc.tasks.internal;

import com.ttloc.qtcsvc.identity.CurrentUser;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.tasks.Task;
import com.ttloc.qtcsvc.tasks.TaskCompletedEvent;
import com.ttloc.qtcsvc.tasks.TaskScope;
import com.ttloc.qtcsvc.tasks.TaskStatus;
import com.ttloc.qtcsvc.tasks.TaskStep;
import com.ttloc.qtcsvc.tasks.TaskStepStatus;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
class TaskService {

    private final TaskRepository repository;
    private final ApplicationEventPublisher events;

    TaskService(TaskRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    // ---- Task CRUD ----

    List<Task> list(CurrentUser currentUser, TaskScope scope, Integer year, Integer quarter, Integer month, Long ownerUserId) {
        Stream<Task> stream = repository.findAll().stream();
        if (scope != null) {
            stream = stream.filter(t -> t.scope() == scope);
        }
        if (year != null) {
            stream = stream.filter(t -> t.year() == year);
        }
        if (quarter != null) {
            stream = stream.filter(t -> quarter.equals(t.quarter()));
        }
        if (month != null) {
            stream = stream.filter(t -> month.equals(t.month()));
        }
        if (ownerUserId != null) {
            stream = stream.filter(t -> ownerUserId.equals(t.ownerUserId()));
        }
        // PERSONAL: STAFF chi thay cua minh; EDITOR/ADMIN thay het (de lam bao cao - spec 7.2)
        if (!currentUser.isEditorOrAdmin()) {
            stream = stream.filter(t -> t.scope() == TaskScope.DEPT || currentUser.id().equals(t.ownerUserId()));
        }
        return stream.sorted(Comparator.comparingInt(Task::sortOrder)).toList();
    }

    Task get(Long id) {
        return findOrThrow(id);
    }

    Task create(CurrentUser currentUser, TaskRequest request) {
        validate(request);
        if (request.scope() == TaskScope.DEPT && !currentUser.isEditorOrAdmin()) {
            throw new AccessDeniedException("Chi EDITOR/ADMIN duoc tao nhiem vu chung phong");
        }
        Long ownerUserId = request.scope() == TaskScope.PERSONAL ? currentUser.id() : null;
        Integer quarter = deriveQuarter(request.month(), request.quarter());
        Instant now = Instant.now();
        Task task = new Task(null, request.scope(), request.year(), quarter, request.month(), request.title(),
                request.description(), request.assigneeId(), ownerUserId, TaskStatus.CHUA_BAT_DAU, 0,
                request.sortOrder() == null ? 0 : request.sortOrder(), now, now, Set.of());
        return repository.save(task);
    }

    Task update(CurrentUser currentUser, Long id, TaskRequest request) {
        Task existing = findOrThrow(id);
        assertCanEdit(currentUser, existing);

        Integer newMonth = request.month() != null ? request.month() : existing.month();
        Integer newQuarter = request.month() != null || request.quarter() != null
                ? deriveQuarter(newMonth, request.quarter() != null ? request.quarter() : existing.quarter())
                : existing.quarter();

        Task updated = new Task(
                existing.id(), existing.scope(),
                request.year() != null ? request.year() : existing.year(),
                newQuarter,
                newMonth,
                request.title() != null ? request.title() : existing.title(),
                request.description() != null ? request.description() : existing.description(),
                request.assigneeId() != null ? request.assigneeId() : existing.assigneeId(),
                existing.ownerUserId(), existing.status(), existing.progressPercent(),
                request.sortOrder() != null ? request.sortOrder() : existing.sortOrder(),
                existing.createdAt(), Instant.now(), existing.steps());
        return repository.save(updated);
    }

    Task changeStatus(CurrentUser currentUser, Long id, TaskStatus newStatus) {
        Task existing = findOrThrow(id);
        assertCanEdit(currentUser, existing);
        boolean hasSteps = !existing.steps().isEmpty();
        if (hasSteps && !TaskProgressCalculator.isManualOverrideStatus(newStatus)) {
            throw new IllegalArgumentException(
                    "Nhiem vu co buoc: trang thai duoc tinh tu dong tu cac buoc, chi dat thu cong duoc TAM_DUNG/HUY");
        }
        int progress = hasSteps
                ? existing.progressPercent()
                : TaskProgressCalculator.manualProgressFor(newStatus, existing.progressPercent());
        Task saved = repository.save(withStatusAndProgress(existing, newStatus, progress));
        publishIfNewlyCompleted(existing, saved);
        return saved;
    }

    void delete(CurrentUser currentUser, Long id) {
        Task existing = findOrThrow(id);
        assertCanEdit(currentUser, existing);
        repository.deleteById(id);
    }

    // ---- TaskStep (thao tac tren aggregate) ----

    Task addStep(CurrentUser currentUser, Long taskId, TaskStepRequest request) {
        Task task = findOrThrow(taskId);
        assertCanEdit(currentUser, task);
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Ten buoc khong duoc de trong");
        }
        Instant now = Instant.now();
        int nextSort = task.steps().stream().mapToInt(TaskStep::sortOrder).max().orElse(0) + 1;
        TaskStep step = new TaskStep(null, request.title(), TaskStepStatus.CHUA_BAT_DAU, request.note(),
                request.sortOrder() == null ? nextSort : request.sortOrder(), now, now);
        Set<TaskStep> newSteps = new HashSet<>(task.steps());
        newSteps.add(step);
        return saveWithRecomputedProgress(task, newSteps);
    }

    Task updateStep(CurrentUser currentUser, Long taskId, Long stepId, TaskStepRequest request) {
        Task task = findOrThrow(taskId);
        assertCanEdit(currentUser, task);
        TaskStep existingStep = findStepOrThrow(task, stepId);
        TaskStep updatedStep = new TaskStep(existingStep.id(),
                request.title() != null ? request.title() : existingStep.title(),
                existingStep.status(),
                request.note() != null ? request.note() : existingStep.note(),
                request.sortOrder() != null ? request.sortOrder() : existingStep.sortOrder(),
                existingStep.createdAt(), Instant.now());
        return saveWithRecomputedProgress(task, replaceStep(task.steps(), stepId, updatedStep));
    }

    Task changeStepStatus(CurrentUser currentUser, Long taskId, Long stepId, TaskStepStatus status, String note) {
        Task task = findOrThrow(taskId);
        assertCanEdit(currentUser, task);
        TaskStep existingStep = findStepOrThrow(task, stepId);
        TaskStep updatedStep = new TaskStep(existingStep.id(), existingStep.title(), status,
                note != null ? note : existingStep.note(), existingStep.sortOrder(), existingStep.createdAt(), Instant.now());
        return saveWithRecomputedProgress(task, replaceStep(task.steps(), stepId, updatedStep));
    }

    Task deleteStep(CurrentUser currentUser, Long taskId, Long stepId) {
        Task task = findOrThrow(taskId);
        assertCanEdit(currentUser, task);
        findStepOrThrow(task, stepId);
        Set<TaskStep> newSteps = task.steps().stream()
                .filter(s -> !s.id().equals(stepId))
                .collect(Collectors.toSet());
        return saveWithRecomputedProgress(task, newSteps);
    }

    Task reorderSteps(CurrentUser currentUser, Long taskId, List<Long> orderedStepIds) {
        Task task = findOrThrow(taskId);
        assertCanEdit(currentUser, task);
        Map<Long, TaskStep> byId = task.steps().stream().collect(Collectors.toMap(TaskStep::id, s -> s));
        Set<TaskStep> newSteps = new HashSet<>();
        int order = 1;
        for (Long stepId : orderedStepIds) {
            TaskStep s = byId.get(stepId);
            if (s == null) {
                throw new NotFoundException("Buoc khong thuoc nhiem vu nay: " + stepId);
            }
            newSteps.add(new TaskStep(s.id(), s.title(), s.status(), s.note(), order++, s.createdAt(), Instant.now()));
        }
        return saveWithRecomputedProgress(task, newSteps);
    }

    // ---- helpers ----

    private Task saveWithRecomputedProgress(Task task, Set<TaskStep> newSteps) {
        int progress = TaskProgressCalculator.progressFromSteps(newSteps);
        TaskStatus status = TaskProgressCalculator.isManualOverrideStatus(task.status())
                ? task.status()
                : TaskProgressCalculator.statusFromSteps(newSteps, progress);
        Task updated = new Task(task.id(), task.scope(), task.year(), task.quarter(), task.month(), task.title(),
                task.description(), task.assigneeId(), task.ownerUserId(), status, progress, task.sortOrder(),
                task.createdAt(), Instant.now(), newSteps);
        Task saved = repository.save(updated);
        publishIfNewlyCompleted(task, saved);
        return saved;
    }

    private void publishIfNewlyCompleted(Task before, Task after) {
        if (after.status() == TaskStatus.HOAN_THANH && before.status() != TaskStatus.HOAN_THANH) {
            events.publishEvent(new TaskCompletedEvent(after.id()));
        }
    }

    private Task withStatusAndProgress(Task task, TaskStatus status, int progress) {
        return new Task(task.id(), task.scope(), task.year(), task.quarter(), task.month(), task.title(),
                task.description(), task.assigneeId(), task.ownerUserId(), status, progress, task.sortOrder(),
                task.createdAt(), Instant.now(), task.steps());
    }

    private Set<TaskStep> replaceStep(Set<TaskStep> steps, Long stepId, TaskStep replacement) {
        return steps.stream()
                .map(s -> s.id().equals(stepId) ? replacement : s)
                .collect(Collectors.toSet());
    }

    private TaskStep findStepOrThrow(Task task, Long stepId) {
        return task.steps().stream()
                .filter(s -> s.id() != null && s.id().equals(stepId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Khong tim thay buoc: " + stepId));
    }

    private Task findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay nhiem vu: " + id));
    }

    private void assertCanEdit(CurrentUser currentUser, Task task) {
        if (task.scope() == TaskScope.DEPT) {
            if (!currentUser.isEditorOrAdmin()) {
                throw new AccessDeniedException("Chi EDITOR/ADMIN duoc sua nhiem vu chung phong");
            }
        } else if (!currentUser.id().equals(task.ownerUserId())) {
            throw new AccessDeniedException("Ban chi duoc sua nhiem vu ca nhan cua chinh minh");
        }
    }

    private void validate(TaskRequest request) {
        if (request.scope() == null) {
            throw new IllegalArgumentException("Phai chon pham vi (DEPT/PERSONAL)");
        }
        if (request.year() == null) {
            throw new IllegalArgumentException("Phai co nam");
        }
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Tieu de khong duoc de trong");
        }
    }

    /**
     * KHONG dung toan tu 3 ngoi tron int/Integer o day: mot nhanh la int (bieu
     * thuc so hoc), nhanh kia la Integer - Java se ep unbox nhanh Integer du
     * khong duoc chon, NPE khi explicitQuarter null (da gap loi nay thuc te).
     */
    private Integer deriveQuarter(Integer month, Integer explicitQuarter) {
        if (month != null) {
            return ((month - 1) / 3) + 1;
        }
        return explicitQuarter;
    }

}
