package com.ttloc.qtcsvc.identity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("members")
public record Member(
        @Id Long id,
        String name,
        String position,
        String email,
        String phone,
        boolean active,
        int sortOrder
) {
}
