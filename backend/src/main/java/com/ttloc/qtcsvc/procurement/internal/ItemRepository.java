package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementItem;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

interface ItemRepository extends ListCrudRepository<ProcurementItem, Long> {

    List<ProcurementItem> findByAudienceOrderBySortOrderAscIdAsc(String audience);

    Optional<ProcurementItem> findByAudienceAndCode(String audience, String code);

}
