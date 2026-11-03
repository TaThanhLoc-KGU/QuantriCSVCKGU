package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementItem;
import com.ttloc.qtcsvc.procurement.ProcurementUnit;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.ImportPreview;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.ItemRequest;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.RoundRequest;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.RoundView;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.StatusRow;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SubmissionDetail;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SummaryView;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.UnitRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/procurement")
class ProcurementAdminController {

    private final ProcurementService service;
    private final ProcurementExcel excel;
    private final ProcurementHandover handover;

    ProcurementAdminController(ProcurementService service, ProcurementExcel excel, ProcurementHandover handover) {
        this.service = service;
        this.excel = excel;
        this.handover = handover;
    }

    // ----- Dot -----

    @GetMapping("/rounds")
    List<RoundView> rounds(@RequestParam String audience) {
        return service.listRounds(audience);
    }

    @PostMapping("/rounds")
    RoundView createRound(@RequestBody RoundRequest req) {
        return service.createRound(req);
    }

    @PutMapping("/rounds/{id}")
    RoundView updateRound(@PathVariable Long id, @RequestBody RoundRequest req) {
        return service.updateRound(id, req);
    }

    @DeleteMapping("/rounds/{id}")
    ResponseEntity<Void> deleteRound(@PathVariable Long id) {
        service.deleteRound(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rounds/{id}/status")
    List<StatusRow> status(@PathVariable Long id) {
        return service.status(id);
    }

    @GetMapping("/rounds/{id}/summary")
    SummaryView summary(@PathVariable Long id) {
        return service.summary(id);
    }

    @GetMapping("/rounds/{id}/units/{unitId}")
    SubmissionDetail detail(@PathVariable Long id, @PathVariable Long unitId) {
        return service.detail(id, unitId);
    }

    @DeleteMapping("/rounds/{id}/units/{unitId}")
    ResponseEntity<Void> clear(@PathVariable Long id, @PathVariable Long unitId) {
        service.clearSubmission(id, unitId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rounds/{id}/units/{unitId}/handover")
    ResponseEntity<byte[]> handover(@PathVariable Long id, @PathVariable Long unitId, @RequestBody ProcurementDtos.HandoverRequest req) {
        service.detail(id, unitId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bien-ban-ban-giao-" + id + "-" + unitId + ".xlsx\"")
                .body(handover.build(req));
    }

    @GetMapping("/rounds/{id}/export")
    ResponseEntity<byte[]> export(@PathVariable Long id) {
        byte[] content = excel.export(service.exportData(id));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"tong-hop-mua-sam-" + id + ".xlsx\"")
                .body(content);
    }

    // ----- Don vi -----

    @GetMapping("/units")
    List<ProcurementUnit> units(@RequestParam String audience) {
        return service.listUnits(audience);
    }

    @PostMapping("/units")
    ProcurementUnit createUnit(@RequestBody UnitRequest req) {
        return service.createUnit(req);
    }

    @PutMapping("/units/{id}")
    ProcurementUnit updateUnit(@PathVariable Long id, @RequestBody UnitRequest req) {
        return service.updateUnit(id, req);
    }

    @DeleteMapping("/units/{id}")
    ResponseEntity<Void> deleteUnit(@PathVariable Long id) {
        service.deleteUnit(id);
        return ResponseEntity.noContent().build();
    }

    // ----- Danh muc hang -----

    @GetMapping("/items/template")
    ResponseEntity<byte[]> itemTemplate() {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mau-nhap-danh-muc-hang.xlsx\"")
                .body(excel.itemTemplate());
    }

    @GetMapping("/items")
    List<ProcurementItem> items(@RequestParam String audience) {
        return service.listItems(audience);
    }

    @PostMapping("/items")
    ProcurementItem createItem(@RequestBody ItemRequest req) {
        return service.createItem(req);
    }

    @PutMapping("/items/{id}")
    ProcurementItem updateItem(@PathVariable Long id, @RequestBody ItemRequest req) {
        return service.updateItem(id, req);
    }

    @DeleteMapping("/items/{id}")
    ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        service.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * preview=true (mac dinh): chi doc + kiem tra, KHONG ghi DB. preview=false:
     * them mat hang moi (theo ma) + cap nhat mat hang da co, khong xoa.
     */
    @PostMapping(value = "/items/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Object importItems(@RequestParam String audience, @RequestParam(defaultValue = "true") boolean preview,
                       @RequestParam("file") MultipartFile file) throws IOException {
        String aud = ProcurementService.audience(audience);
        ProcurementExcel.ParseResult parsed = excel.parseItems(file.getInputStream(), aud);
        List<ProcurementItem> resolved = service.resolveCodes(aud, parsed.items());
        if (preview) {
            int existing = service.countExisting(aud, resolved);
            List<String> errors = parsed.errors().stream()
                    .map(e -> "Dòng " + e.rowNumber() + ": " + e.message()).limit(20).toList();
            return new ImportPreview(resolved.size(), resolved.size() - existing, existing, errors);
        }
        if (resolved.isEmpty()) {
            throw new IllegalArgumentException("Không có dòng hợp lệ nào để nhập.");
        }
        return service.upsertItems(aud, resolved);
    }

}
