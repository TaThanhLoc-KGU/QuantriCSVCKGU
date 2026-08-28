package com.ttloc.qtcsvc.report.internal;

import com.ttloc.qtcsvc.report.PeriodType;
import com.ttloc.qtcsvc.report.Report;

import java.time.Instant;
import java.util.Map;

record ReportSectionsRequest(Map<String, String> sections) {
}

record ReportView(Long id, PeriodType periodType, String periodId, int year, Map<String, String> sections,
                   String aiProvider, Instant aiGeneratedAt, Long updatedBy, Instant updatedAt) {

    static ReportView from(Report report, Map<String, String> sections) {
        return new ReportView(report.id(), report.periodType(), report.periodId(), report.year(), sections,
                report.aiProvider(), report.aiGeneratedAt(), report.updatedBy(), report.updatedAt());
    }

}
