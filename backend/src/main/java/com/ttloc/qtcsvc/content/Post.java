package com.ttloc.qtcsvc.content;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("posts")
public record Post(
        @Id Long id,
        String title,
        String slug,
        String summary,
        String content,
        String thumbnailUrl,
        Long categoryId,
        Long authorId,
        PostStatus status,
        boolean featured,
        boolean pinned,
        int viewCount,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt
) {
}
