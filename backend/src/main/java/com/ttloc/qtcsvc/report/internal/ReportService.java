package com.ttloc.qtcsvc.report.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ttloc.qtcsvc.identity.CurrentUser;
import com.ttloc.qtcsvc.report.Json;
import com.ttloc.qtcsvc.report.Report;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
class ReportService {

    private final ReportRepository repository;
    private final ObjectMapper objectMapper;
    private final ReportAiService aiService;

    ReportService(ReportRepository repository, ObjectMapper objectMapper, ReportAiService aiService) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.aiService = aiService;
    }

    ReportView get(String periodId) {
        Report report = getOrCreate(periodId);
        return ReportView.from(report, readSections(report));
    }

    ReportView updateSections(String periodId, CurrentUser currentUser, Map<String, String> sections) {
        Report existing = getOrCreate(periodId);
        Report updated = new Report(existing.id(), existing.periodType(), existing.periodId(), existing.year(),
                writeSections(sections), existing.aiProvider(), existing.aiGeneratedAt(),
                currentUser.id(), Instant.now());
        Report saved = repository.save(updated);
        return ReportView.from(saved, sections);
    }

    /**
     * Sinh nhap AI cho mục 3/4, MERGE vao sections hien co (khong dung cac
     * muc soan tu do khac nhu muc1/muc2/muc5 - spec 8.3).
     */
    ReportView generateDraft(String periodId, CurrentUser currentUser) {
        Report existing = getOrCreate(periodId);
        ParsedPeriod period = ParsedPeriod.parse(periodId);
        ReportAiService.DraftResult draft = aiService.generateDraft(period);

        Map<String, String> currentSections = readSections(existing);
        currentSections.putAll(draft.sections());

        Report updated = new Report(existing.id(), existing.periodType(), existing.periodId(), existing.year(),
                writeSections(currentSections), draft.provider(), Instant.now(), currentUser.id(), Instant.now());
        Report saved = repository.save(updated);
        return ReportView.from(saved, currentSections);
    }

    Report getOrCreate(String periodId) {
        return repository.findByPeriodId(periodId).orElseGet(() -> {
            ParsedPeriod parsed = ParsedPeriod.parse(periodId);
            Report fresh = new Report(null, parsed.type(), periodId, parsed.year(), new Json("{}"), null, null, null, Instant.now());
            return repository.save(fresh);
        });
    }

    Map<String, String> readSections(Report report) {
        if (report.sections() == null || report.sections().value() == null || report.sections().value().isBlank()) {
            return new LinkedHashMap<>();
        }
        try {
            return objectMapper.readValue(report.sections().value(), new TypeReference<LinkedHashMap<String, String>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Du lieu sections cua bao cao bi loi dinh dang JSON", e);
        }
    }

    Json writeSections(Map<String, String> sections) {
        try {
            return new Json(objectMapper.writeValueAsString(sections == null ? Map.of() : sections));
        } catch (Exception e) {
            throw new IllegalStateException("Khong the ghi sections thanh JSON", e);
        }
    }

}
