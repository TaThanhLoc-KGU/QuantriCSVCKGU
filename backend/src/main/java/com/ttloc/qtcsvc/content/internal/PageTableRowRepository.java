package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.PageTableRow;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface PageTableRowRepository extends ListCrudRepository<PageTableRow, Long> {

    List<PageTableRow> findByBlockIdOrderBySortOrder(Long blockId);

    List<PageTableRow> findByBlockIdInOrderBySortOrder(List<Long> blockIds);

}
