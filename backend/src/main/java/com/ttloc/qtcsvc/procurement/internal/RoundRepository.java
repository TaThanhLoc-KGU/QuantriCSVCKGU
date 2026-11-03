package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementRound;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

interface RoundRepository extends ListCrudRepository<ProcurementRound, Long> {

    List<ProcurementRound> findByAudienceOrderByCreatedAtDesc(String audience);

    List<ProcurementRound> findByAcceptingTrueOrderByCreatedAtDesc();

}
