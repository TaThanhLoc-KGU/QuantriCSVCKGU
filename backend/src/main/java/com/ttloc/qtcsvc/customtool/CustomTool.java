package com.ttloc.qtcsvc.customtool;

import com.ttloc.qtcsvc.shared.Json;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

/**
 * 1 chuc nang do don vi tu tao. kind=FORM: bieu mau thu thap thong tin (config.fields...);
 * kind=LOOKUP: bang tra cuu theo 1 cot khoa (config.columns, config.keyColumn...).
 */
@Table("custom_tools")
public record CustomTool(
        @Id Long id,
        String slug,
        String name,
        String description,
        String kind,
        Json config,
        boolean active,
        int sortOrder,
        Instant createdAt
) {
}
