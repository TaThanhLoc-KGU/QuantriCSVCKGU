package com.ttloc.qtcsvc.report.internal;

import com.ttloc.qtcsvc.identity.CurrentUserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
class ReportController {

    private final ReportService service;
    private final CurrentUserService currentUserService;
    private final ReportDocxExportService docxExportService;

    ReportController(ReportService service, CurrentUserService currentUserService,
                      ReportDocxExportService docxExportService) {
        this.service = service;
        this.currentUserService = currentUserService;
        this.docxExportService = docxExportService;
    }

    @GetMapping("/{periodId}")
    ReportView get(@PathVariable String periodId) {
        return service.get(periodId);
    }

    @PutMapping("/{periodId}")
    ReportView update(@PathVariable String periodId, @RequestBody ReportSectionsRequest request) {
        return service.updateSections(periodId, currentUserService.requireCurrent(), request.sections());
    }

    @PostMapping("/{periodId}/generate")
    ReportView generate(@PathVariable String periodId) {
        return service.generateDraft(periodId, currentUserService.requireCurrent());
    }

    @GetMapping("/{periodId}/export/docx")
    ResponseEntity<byte[]> exportDocx(@PathVariable String periodId) {
        byte[] content = docxExportService.export(periodId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-" + periodId + ".docx\"")
                .body(content);
    }

}
