package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.NotificationLevel;
import com.ttloc.qtcsvc.content.NotificationType;

import java.time.LocalDate;

record NotificationRequest(String title, String content, NotificationType type, NotificationLevel level,
                            Boolean pinned, LocalDate effectiveDate, LocalDate expiryDate) {
}
