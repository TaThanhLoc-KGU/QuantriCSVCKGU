package com.ttloc.qtcsvc.content;

import com.ttloc.qtcsvc.shared.Json;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

/**
 * 1 dong du lieu cua khoi DATA_TABLE (xem PageBlock). groupKey khop voi "key"
 * cua 1 phan tu trong config.groups cua khoi (null neu khoi khong loc theo
 * nhom). data la JSON {columnKey: value} - hinh dang gia tri phu thuoc kieu
 * cot: TEXT/DATE la chuoi, LINK la {"url","label"}, FILE la {"mediaId","url","name"}.
 */
@Table("page_table_rows")
public record PageTableRow(
        @Id Long id,
        Long blockId,
        String groupKey,
        int sortOrder,
        Json data
) {
}
