package com.ttloc.qtcsvc.customtool;

import com.ttloc.qtcsvc.shared.Json;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("custom_tool_rows")
public record CustomToolRow(
        @Id Long id,
        Long toolId,
        String keyValue,
        Json data
) {
}
