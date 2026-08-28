package com.ttloc.qtcsvc.tasks;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("task_steps")
public record TaskStep(
        @Id Long id,
        String title,
        TaskStepStatus status,
        String note,
        int sortOrder,
        Instant createdAt,
        Instant updatedAt
) {
}
