package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.PageTableRowItem;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

interface PageTableRowItemRepository extends ListCrudRepository<PageTableRowItem, Long> {

    List<PageTableRowItem> findByRowIdOrderBySortOrder(Long rowId);

    List<PageTableRowItem> findByRowIdInOrderBySortOrder(List<Long> rowIds);

    long countByRowId(Long rowId);

    @Modifying
    @Query("DELETE FROM page_table_row_items WHERE row_id = :rowId")
    void deleteAllByRow(@Param("rowId") Long rowId);

}
