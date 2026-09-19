package com.ttloc.qtcsvc.content;

import com.ttloc.qtcsvc.shared.Json;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

/** 1 muc chi tiet thuoc 1 dong cua khoi DATA_TABLE (vd 1 hoc phan cua 1 nganh). data: {detailColumnKey: value}. */
@Table("page_table_row_items")
public record PageTableRowItem(
        @Id Long id,
        Long rowId,
        int sortOrder,
        Json data
) {
}
