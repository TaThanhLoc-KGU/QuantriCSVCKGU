package com.ttloc.qtcsvc.procurement;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("procurement_lines")
public record ProcurementLine(
        @Id Long id,
        Long submissionId,
        String itemCode,
        String itemName,
        String unitLabel,
        int qty,
        String note
) {
}
