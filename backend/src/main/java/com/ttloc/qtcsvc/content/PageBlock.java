package com.ttloc.qtcsvc.content;

import com.ttloc.qtcsvc.shared.Json;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

/**
 * 1 khoi noi dung trong danh muc kind=PAGE ("trang con") - xem PageBlockType.
 * config luu JSON tho, hinh dang tuy loai khoi:
 * - RICH_TEXT: {"html": "..."}
 * - POST_LIST: {"categoryId": 5, "limit": 6}
 * - DATA_TABLE: {"groupLabel": "Nganh dao tao" | null,
 *                "columns": [{"key":"c1","label":"Ten ho so","type":"TEXT|DATE|LINK|FILE"}],
 *                "groups": [{"key":"g1","name":"..."}]}
 * - STAFF_LIST: {} (luon hien toan bo nhan su active, khong cau hinh rieng)
 */
@Table("page_blocks")
public record PageBlock(
        @Id Long id,
        Long categoryId,
        PageBlockType type,
        String title,
        int sortOrder,
        Json config,
        Instant createdAt,
        Instant updatedAt
) {
}
