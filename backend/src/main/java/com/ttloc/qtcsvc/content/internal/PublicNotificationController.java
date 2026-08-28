package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Notification;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/notifications")
class PublicNotificationController {

    private final NotificationService service;

    PublicNotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping
    List<Notification> list() {
        return service.publicList();
    }

}
