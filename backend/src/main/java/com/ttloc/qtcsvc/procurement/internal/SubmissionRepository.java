package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementSubmission;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

interface SubmissionRepository extends ListCrudRepository<ProcurementSubmission, Long> {

    List<ProcurementSubmission> findByRoundId(Long roundId);

    Optional<ProcurementSubmission> findByRoundIdAndUnitId(Long roundId, Long unitId);

    boolean existsByUnitId(Long unitId);

}
