package com.ttloc.qtcsvc.feedback;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("feedback_messages")
public record FeedbackMessage(
        @Id Long id,
        String fullName,
        String email,
        String phone,
        String subject,
        String content,
        String status,
        String adminNote,
        Instant createdAt,
        Instant processedAt
) {
}
