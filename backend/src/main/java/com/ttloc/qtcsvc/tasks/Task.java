package com.ttloc.qtcsvc.tasks;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.MappedCollection;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;
import java.util.Set;

/**
 * Aggregate root: Task so huu TaskStep (spec - chuyen tu JPA sang Spring Data
 * JDBC). Set (khong phai List) de tranh Spring Data JDBC phai quan ly cot thu
 * tu noi bo cho List; thu tu hien thi thuc te dua vao TaskStep.sortOrder,
 * tu sap xep o tang service khi doc.
 */
@Table("tasks")
public record Task(
        @Id Long id,
        TaskScope scope,
        int year,
        Integer quarter,
        Integer month,
        String title,
        String description,
        Long assigneeId,
        Long ownerUserId,
        TaskStatus status,
        int progressPercent,
        int sortOrder,
        Instant createdAt,
        Instant updatedAt,
        @MappedCollection(idColumn = "task_id") Set<TaskStep> steps
) {
}
