package com.ttloc.qtcsvc.content;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("gallery_items")
public record GalleryItem(
        @Id Long id,
        String type,
        String title,
        String url,
        int sortOrder,
        boolean active
) {
}
