package com.ttloc.qtcsvc.settings;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("system_settings")
public record SystemSetting(@Id String key, String value, Long updatedBy, Instant updatedAt) {
}
