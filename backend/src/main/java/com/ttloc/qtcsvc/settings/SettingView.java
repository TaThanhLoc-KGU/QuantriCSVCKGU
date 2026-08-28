package com.ttloc.qtcsvc.settings;

import java.time.Instant;

/**
 * DTO cho man hinh Settings. Voi key nhay cam (vd ai.apiKey), "value" luon null
 * va chi tra "configured=true/false" - khong bao gio lo gia tri that ra ngoai.
 */
public record SettingView(String key, String value, boolean configured, Instant updatedAt) {
}
