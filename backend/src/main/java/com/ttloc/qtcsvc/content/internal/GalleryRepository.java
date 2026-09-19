package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.GalleryItem;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

interface GalleryRepository extends ListCrudRepository<GalleryItem, Long> {

    List<GalleryItem> findAllByOrderBySortOrderAscIdDesc();

    List<GalleryItem> findByActiveTrueOrderBySortOrderAscIdDesc();

}
