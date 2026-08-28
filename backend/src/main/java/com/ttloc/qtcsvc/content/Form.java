package com.ttloc.qtcsvc.content;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("forms")
public record Form(
        @Id Long id,
        String title,
        String description,
        Long categoryId,
        Long fileId,
        String version,
        int downloadCount,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}
