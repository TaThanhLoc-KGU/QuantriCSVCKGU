package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementUnit;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

interface UnitRepository extends ListCrudRepository<ProcurementUnit, Long> {

    List<ProcurementUnit> findByAudienceOrderBySortOrderAscIdAsc(String audience);

    Optional<ProcurementUnit> findByAudienceAndCode(String audience, String code);

}
