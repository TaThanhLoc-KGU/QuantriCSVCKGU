package com.ttloc.qtcsvc.procurement;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("procurement_items")
public record ProcurementItem(
        @Id Long id,
        String audience,
        String code,
        String groupName,
        String name,
        String unitLabel,
        int sortOrder,
        boolean visible
) {
}
