package com.ttloc.qtcsvc.content;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;

@Table("banners")
public record Banner(
        @Id Long id,
        String title,
        String imageUrl,
        String linkUrl,
        int sortOrder,
        boolean active,
        LocalDate startDate,
        LocalDate endDate
) {
}
