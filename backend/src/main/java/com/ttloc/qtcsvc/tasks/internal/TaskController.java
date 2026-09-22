package com.ttloc.qtcsvc.tasks.internal;

import com.ttloc.qtcsvc.identity.CurrentUserService;
import com.ttloc.qtcsvc.tasks.Task;
import com.ttloc.qtcsvc.tasks.TaskScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Task + TaskStep la 1 aggregate (Spring Data JDBC) - moi thao tac tren buoc
 * (them/sua/xoa/sap xep/doi trang thai) deu di qua Task va tra ve Task moi
 * nhat, khong co repository/controller rieng cho TaskStep.
 */
@RestController
@RequestMapping("/api/admin/tasks")
class TaskController {

    private final TaskService service;
    private final CurrentUserService currentUserService;

    TaskController(TaskService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    List<TaskView> list(@RequestParam(required = false) TaskScope scope,
                         @RequestParam(required = false) Integer year,
                         @RequestParam(required = false) Integer quarter,
                         @RequestParam(required = false) Integer month,
                         @RequestParam(required = false) Long owner) {
        return service.list(currentUserService.requireCurrent(), scope, year, quarter, month, owner)
                .stream().map(TaskView::from).toList();
    }

    @GetMapping("/{id}")
    TaskView get(@PathVariable Long id) {
        return TaskView.from(service.get(id));
    }

    @PostMapping
    ResponseEntity<TaskView> create(@RequestBody TaskRequest request) {
        Task created = service.create(currentUserService.requireCurrent(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(TaskView.from(created));
    }

    @PutMapping("/{id}")
    TaskView update(@PathVariable Long id, @RequestBody TaskRequest request) {
        return TaskView.from(service.update(currentUserService.requireCurrent(), id, request));
    }

    @PatchMapping("/{id}/status")
    TaskView changeStatus(@PathVariable Long id, @RequestBody TaskStatusRequest request) {
        return TaskView.from(service.changeStatus(currentUserService.requireCurrent(), id, request.status()));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(currentUserService.requireCurrent(), id);
        return ResponseEntity.noContent().build();
    }

    // ---- steps ----

    @GetMapping("/{id}/steps")
    List<com.ttloc.qtcsvc.tasks.TaskStep> listSteps(@PathVariable Long id) {
        return TaskView.from(service.get(id)).steps();
    }

    @PostMapping("/{id}/steps")
    ResponseEntity<TaskView> addStep(@PathVariable Long id, @RequestBody TaskStepRequest request) {
        TaskView view = TaskView.from(service.addStep(currentUserService.requireCurrent(), id, request));
        return ResponseEntity.status(HttpStatus.CREATED).body(view);
    }

    @PutMapping("/{id}/steps/{stepId}")
    TaskView updateStep(@PathVariable Long id, @PathVariable Long stepId, @RequestBody TaskStepRequest request) {
        return TaskView.from(service.updateStep(currentUserService.requireCurrent(), id, stepId, request));
    }

    @PatchMapping("/{id}/steps/{stepId}/status")
    TaskView changeStepStatus(@PathVariable Long id, @PathVariable Long stepId, @RequestBody TaskStepStatusRequest request) {
        return TaskView.from(service.changeStepStatus(currentUserService.requireCurrent(), id, stepId,
                request.status(), request.note()));
    }

    @DeleteMapping("/{id}/steps/{stepId}")
    TaskView deleteStep(@PathVariable Long id, @PathVariable Long stepId) {
        return TaskView.from(service.deleteStep(currentUserService.requireCurrent(), id, stepId));
    }

    @PatchMapping("/{id}/steps/reorder")
    TaskView reorderSteps(@PathVariable Long id, @RequestBody ReorderStepsRequest request) {
        return TaskView.from(service.reorderSteps(currentUserService.requireCurrent(), id, request.orderedStepIds()));
    }

}
