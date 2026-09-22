package com.ttloc.qtcsvc.content;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.time.LocalDate;

@Table("notifications")
public record Notification(
        @Id Long id,
        String title,
        String content,
        NotificationType type,
        NotificationLevel level,
        boolean pinned,
        LocalDate effectiveDate,
        LocalDate expiryDate,
        Long createdBy,
        Instant createdAt
) {
}
