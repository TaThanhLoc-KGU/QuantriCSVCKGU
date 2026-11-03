package com.ttloc.qtcsvc.procurement;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("procurement_submissions")
public record ProcurementSubmission(
        @Id Long id,
        Long roundId,
        Long unitId,
        String generalNote,
        int timesSaved,
        Instant updatedAt
) {
}
