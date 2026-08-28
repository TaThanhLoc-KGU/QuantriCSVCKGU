package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Notification;
import com.ttloc.qtcsvc.identity.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
class NotificationAdminController {

    private final NotificationService service;
    private final CurrentUserService currentUserService;

    NotificationAdminController(NotificationService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    List<Notification> list() {
        return service.adminList(currentUserService.requireCurrent());
    }

    @PostMapping
    ResponseEntity<Notification> create(@RequestBody NotificationRequest request) {
        Notification created = service.create(currentUserService.requireCurrent(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    Notification update(@PathVariable Long id, @RequestBody NotificationRequest request) {
        return service.update(currentUserService.requireCurrent(), id, request);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(currentUserService.requireCurrent(), id);
        return ResponseEntity.noContent().build();
    }

}
