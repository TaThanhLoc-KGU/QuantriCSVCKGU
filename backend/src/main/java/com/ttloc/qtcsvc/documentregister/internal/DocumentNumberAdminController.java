package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentNumber;
import com.ttloc.qtcsvc.identity.CurrentUserService;
import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.FileTypeSupport;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

import java.util.List;
import java.util.Map;

/**
 * So so van ban - ai dang nhap cung xin so duoc, ghi thang vao so (spec 6.1).
 * Sua/xoa dong cua nguoi khac: chi EDITOR/ADMIN (kiem tra o service).
 */
@RestController
@RequestMapping("/api/admin/document-numbers")
class DocumentNumberAdminController {

    private final DocumentNumberService service;
    private final CurrentUserService currentUserService;
    private final DocumentNumberExportService exportService;
    private final DocumentNumberImportService importService;
    private final FileStorageService fileStorage;
    private final AttachmentPreviewService previewService;

    DocumentNumberAdminController(DocumentNumberService service, CurrentUserService currentUserService,
                                   DocumentNumberExportService exportService, DocumentNumberImportService importService,
                                   FileStorageService fileStorage, AttachmentPreviewService previewService) {
        this.service = service;
        this.currentUserService = currentUserService;
        this.exportService = exportService;
        this.importService = importService;
        this.fileStorage = fileStorage;
        this.previewService = previewService;
    }

    @GetMapping
    List<DocumentNumber> list(@RequestParam("type") Long documentTypeId, @RequestParam int year) {
        return service.list(documentTypeId, year);
    }

    @GetMapping("/next")
    Map<String, Integer> next(@RequestParam("type") Long documentTypeId, @RequestParam int year) {
        return Map.of("nextNumber", service.nextNumber(documentTypeId, year));
    }

    @PostMapping
    ResponseEntity<DocumentNumber> create(@RequestBody DocumentNumberRequest request) {
        DocumentNumber created = service.create(currentUserService.requireCurrent(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    DocumentNumber update(@PathVariable Long id, @RequestBody DocumentNumberRequest request) {
        return service.update(currentUserService.requireCurrent(), id, request);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(currentUserService.requireCurrent(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/attachment")
    ResponseEntity<InputStreamResource> attachment(@PathVariable Long id) {
        DocumentNumber dn = service.get(id);
        if (dn.attachmentUrl() == null) {
            return ResponseEntity.notFound().build();
        }
        InputStreamResource body = new InputStreamResource(fileStorage.open(dn.attachmentUrl()));
        String filename = dn.attachmentName() != null ? dn.attachmentName() : "dinh-kem";
        var inlineType = FileTypeSupport.inlineMediaType(filename);
        MediaType mediaType = inlineType.orElse(MediaType.APPLICATION_OCTET_STREAM);
        String disposition = inlineType.isPresent() ? "inline" : "attachment";
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + filename + "\"")
                .body(body);
    }

    @GetMapping("/{id}/attachment/preview-text")
    ResponseEntity<Map<String, String>> attachmentPreviewText(@PathVariable Long id) {
        DocumentNumber dn = service.get(id);
        if (dn.attachmentUrl() == null || dn.attachmentName() == null || !previewService.supports(dn.attachmentName())) {
            return ResponseEntity.notFound().build();
        }
        String text = previewService.extractText(dn.attachmentUrl(), dn.attachmentName());
        return ResponseEntity.ok(Map.of("text", text));
    }

    @GetMapping("/export")
    ResponseEntity<byte[]> export(@RequestParam("type") Long documentTypeId, @RequestParam int year) {
        byte[] content = exportService.export(documentTypeId, year);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"so-van-ban-" + documentTypeId + "-" + year + ".xlsx\"")
                .body(content);
    }

    /**
     * preview=true (mac dinh): chi doc + kiem tra, tra danh sach dong hop
     * le/loi, KHONG ghi DB. preview=false: chay that qua Spring Batch Job.
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Object importExcel(@RequestParam("type") Long documentTypeId,
                        @RequestParam int year,
                        @RequestParam(defaultValue = "true") boolean preview,
                        @RequestParam("file") MultipartFile file) {
        if (preview) {
            return importService.preview(documentTypeId, year, file);
        }
        return importService.commit(currentUserService.requireCurrent(), documentTypeId, year, file);
    }

}
