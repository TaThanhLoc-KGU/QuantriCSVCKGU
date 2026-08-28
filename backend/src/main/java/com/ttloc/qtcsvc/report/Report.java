package com.ttloc.qtcsvc.report;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

/**
 * sections luu dang chuoi JSON tho, boc trong Json (xem Json.java) - anh xa
 * qua/lai cot jsonb bang custom converter (report.internal.JsonbConverters).
 */
@Table("reports")
public record Report(
        @Id Long id,
        PeriodType periodType,
        String periodId,
        int year,
        Json sections,
        String aiProvider,
        Instant aiGeneratedAt,
        Long updatedBy,
        Instant updatedAt
) {
}
