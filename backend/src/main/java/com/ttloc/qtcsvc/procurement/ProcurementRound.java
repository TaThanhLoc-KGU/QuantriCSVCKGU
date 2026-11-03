package com.ttloc.qtcsvc.procurement;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("procurement_rounds")
public record ProcurementRound(
        @Id Long id,
        String audience,
        String name,
        Instant deadline,
        boolean accepting,
        boolean showPrevious,
        Instant createdAt
) {
}
