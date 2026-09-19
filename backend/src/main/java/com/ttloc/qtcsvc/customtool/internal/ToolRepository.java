package com.ttloc.qtcsvc.customtool.internal;

import com.ttloc.qtcsvc.customtool.CustomTool;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

interface ToolRepository extends ListCrudRepository<CustomTool, Long> {

    Optional<CustomTool> findBySlug(String slug);

    List<CustomTool> findAllByOrderBySortOrderAscIdAsc();

    List<CustomTool> findByActiveTrueOrderBySortOrderAscIdAsc();

}
