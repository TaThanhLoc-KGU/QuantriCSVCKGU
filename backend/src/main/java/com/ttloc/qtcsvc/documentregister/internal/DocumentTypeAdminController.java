package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Xem danh sach loai van ban: moi nguoi da dang nhap (de hien tab trong so van
 * ban - spec 6.2). Them/sua/xoa: chi ADMIN (spec 2.3 "Cau hinh loai van ban").
 */
@RestController
@RequestMapping("/api/admin/document-types")
class DocumentTypeAdminController {

    private final DocumentTypeService service;

    DocumentTypeAdminController(DocumentTypeService service) {
        this.service = service;
    }

    @GetMapping
    List<DocumentType> list() {
        return service.listAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<DocumentType> create(@RequestBody DocumentTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    DocumentType update(@PathVariable Long id, @RequestBody DocumentTypeRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
