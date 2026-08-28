package com.ttloc.qtcsvc.documentregister;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("document_types")
public record DocumentType(
        @Id Long id,
        String code,
        String name,
        String symbolCode,
        Direction direction,
        boolean resetYearly,
        int sortOrder,
        boolean active
) {
}
