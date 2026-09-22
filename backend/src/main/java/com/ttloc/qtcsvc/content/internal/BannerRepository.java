package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Banner;
import org.springframework.data.repository.ListCrudRepository;

import java.time.LocalDate;
import java.util.List;

public interface BannerRepository extends ListCrudRepository<Banner, Long> {

    List<Banner> findByActiveTrueOrderBySortOrder();

    default List<Banner> findVisible(LocalDate today) {
        return findByActiveTrueOrderBySortOrder().stream()
                .filter(b -> (b.startDate() == null || !b.startDate().isAfter(today))
                        && (b.endDate() == null || !b.endDate().isBefore(today)))
                .toList();
    }

}
