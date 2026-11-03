package com.ttloc.qtcsvc.procurement;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("procurement_units")
public record ProcurementUnit(
        @Id Long id,
        String audience,
        String code,
        String name,
        int sortOrder,
        boolean active
) {
}
