package com.ttloc.qtcsvc.content;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("categories")
public record Category(
        @Id Long id,
        String name,
        String slug,
        CategoryKind kind,
        Long parentId,
        int sortOrder,
        String description
) {
}
