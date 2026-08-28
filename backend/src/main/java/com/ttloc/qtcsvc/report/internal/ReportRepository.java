package com.ttloc.qtcsvc.report.internal;

import com.ttloc.qtcsvc.report.Report;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ReportRepository extends CrudRepository<Report, Long> {

    Optional<Report> findByPeriodId(String periodId);

}
