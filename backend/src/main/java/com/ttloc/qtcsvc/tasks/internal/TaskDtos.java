package com.ttloc.qtcsvc.tasks.internal;

import com.ttloc.qtcsvc.tasks.Task;
import com.ttloc.qtcsvc.tasks.TaskScope;
import com.ttloc.qtcsvc.tasks.TaskStatus;
import com.ttloc.qtcsvc.tasks.TaskStep;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

record TaskRequest(TaskScope scope, Integer year, Integer quarter, Integer month, String title, String description,
                    Long assigneeId, Integer sortOrder) {
}

record TaskStatusRequest(TaskStatus status) {
}

record TaskStepRequest(String title, String note, Integer sortOrder) {
}

record TaskStepStatusRequest(com.ttloc.qtcsvc.tasks.TaskStepStatus status, String note) {
}

record ReorderStepsRequest(List<Long> orderedStepIds) {
}

/**
 * View tra ve API: Task.steps() la Set (Spring Data JDBC) nen KHONG dam bao
 * thu tu - TaskView chuyen thanh List da sap theo sortOrder truoc khi serialize.
 */
record TaskView(Long id, TaskScope scope, int year, Integer quarter, Integer month, String title, String description,
                 Long assigneeId, Long ownerUserId, TaskStatus status, int progressPercent, int sortOrder,
                 Instant createdAt, Instant updatedAt, List<TaskStep> steps) {

    static TaskView from(Task t) {
        List<TaskStep> sortedSteps = t.steps().stream()
                .sorted(Comparator.comparingInt(TaskStep::sortOrder))
                .toList();
        return new TaskView(t.id(), t.scope(), t.year(), t.quarter(), t.month(), t.title(), t.description(),
                t.assigneeId(), t.ownerUserId(), t.status(), t.progressPercent(), t.sortOrder(),
                t.createdAt(), t.updatedAt(), sortedSteps);
    }

}
