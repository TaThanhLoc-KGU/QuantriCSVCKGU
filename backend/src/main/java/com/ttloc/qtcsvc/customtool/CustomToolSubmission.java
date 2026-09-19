package com.ttloc.qtcsvc.customtool;

import com.ttloc.qtcsvc.shared.Json;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("custom_tool_submissions")
public record CustomToolSubmission(
        @Id Long id,
        Long toolId,
        String code,
        Json data,
        String status,
        String resultMessage,
        Instant createdAt,
        Instant processedAt
) {
}
