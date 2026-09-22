package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Notification;
import com.ttloc.qtcsvc.content.NotificationLevel;
import com.ttloc.qtcsvc.content.NotificationType;
import com.ttloc.qtcsvc.identity.CurrentUser;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
class NotificationService {

    private final NotificationRepository repository;

    NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    List<Notification> adminList(CurrentUser currentUser) {
        List<Notification> all = repository.findAllByOrderByPinnedDescEffectiveDateDesc();
        if (currentUser.isEditorOrAdmin()) {
            return all;
        }
        return all.stream().filter(n -> currentUser.id().equals(n.createdBy())).toList();
    }

    Notification get(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay thong bao: " + id));
    }

    Notification create(CurrentUser currentUser, NotificationRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Tieu de thong bao khong duoc de trong");
        }
        if (request.effectiveDate() == null) {
            throw new IllegalArgumentException("Phai co ngay hieu luc");
        }
        Notification n = new Notification(null, request.title(), request.content(),
                request.type() == null ? NotificationType.GENERAL : request.type(),
                request.level() == null ? NotificationLevel.NORMAL : request.level(),
                Boolean.TRUE.equals(request.pinned()), request.effectiveDate(), request.expiryDate(),
                currentUser.id(), Instant.now());
        return repository.save(n);
    }

    Notification update(CurrentUser currentUser, Long id, NotificationRequest request) {
        Notification existing = get(id);
        assertCanEdit(currentUser, existing);
        Notification updated = new Notification(
                existing.id(),
                request.title() != null ? request.title() : existing.title(),
                request.content() != null ? request.content() : existing.content(),
                request.type() != null ? request.type() : existing.type(),
                request.level() != null ? request.level() : existing.level(),
                request.pinned() != null ? request.pinned() : existing.pinned(),
                request.effectiveDate() != null ? request.effectiveDate() : existing.effectiveDate(),
                request.expiryDate() != null ? request.expiryDate() : existing.expiryDate(),
                existing.createdBy(),
                existing.createdAt());
        return repository.save(updated);
    }

    void delete(CurrentUser currentUser, Long id) {
        Notification existing = get(id);
        assertCanEdit(currentUser, existing);
        repository.deleteById(id);
    }

    private void assertCanEdit(CurrentUser currentUser, Notification n) {
        if (!currentUser.isEditorOrAdmin() && !currentUser.id().equals(n.createdBy())) {
            throw new AccessDeniedException("Ban chi duoc sua/xoa thong bao cua chinh minh");
        }
    }

    // ---- Public ----

    List<Notification> publicList() {
        return filterEffective(repository.findAllByOrderByPinnedDescEffectiveDateDesc());
    }

    List<Notification> publicByType(NotificationType type) {
        return filterEffective(repository.findByTypeOrderByPinnedDescEffectiveDateDesc(type));
    }

    private List<Notification> filterEffective(List<Notification> notifications) {
        LocalDate today = LocalDate.now();
        return notifications.stream()
                .filter(n -> !n.effectiveDate().isAfter(today) && (n.expiryDate() == null || !n.expiryDate().isBefore(today)))
                .toList();
    }

}
