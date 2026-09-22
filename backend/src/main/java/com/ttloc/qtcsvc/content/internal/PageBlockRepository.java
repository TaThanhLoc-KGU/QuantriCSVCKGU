package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.PageBlock;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface PageBlockRepository extends ListCrudRepository<PageBlock, Long> {

    List<PageBlock> findByCategoryIdOrderBySortOrder(Long categoryId);

    void deleteByCategoryId(Long categoryId);

}
