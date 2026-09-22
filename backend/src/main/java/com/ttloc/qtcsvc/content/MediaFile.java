package com.ttloc.qtcsvc.content;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

@Table("media_files")
public record MediaFile(
        @Id Long id,
        String fileName,
        String originalName,
        String url,
        String mimeType,
        Long size,
        String folder,
        Long uploadedBy,
        Instant createdAt
) {
}
