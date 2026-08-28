package com.ttloc.qtcsvc.content.internal;

import java.time.LocalDate;

record BannerRequest(String title, String imageUrl, String linkUrl, Integer sortOrder, Boolean active,
                      LocalDate startDate, LocalDate endDate) {
}
