package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementLine;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

interface LineRepository extends ListCrudRepository<ProcurementLine, Long> {

    List<ProcurementLine> findBySubmissionIdOrderById(Long submissionId);

    List<ProcurementLine> findBySubmissionIdInOrderById(List<Long> submissionIds);

    @Modifying
    @Query("DELETE FROM procurement_lines WHERE submission_id = :submissionId")
    void deleteAllBySubmission(@Param("submissionId") Long submissionId);

}
