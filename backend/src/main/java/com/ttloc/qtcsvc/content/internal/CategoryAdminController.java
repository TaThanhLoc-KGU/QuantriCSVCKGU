package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Category;
import com.ttloc.qtcsvc.content.CategoryKind;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Quan ly danh muc - chi EDITOR/ADMIN (spec 2.3: STAFF khong duoc quan ly danh muc).
 */
@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
class CategoryAdminController {

    private final CategoryService service;

    CategoryAdminController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    List<Category> list(@RequestParam CategoryKind kind) {
        return service.tree(kind);
    }

    @PostMapping
    ResponseEntity<Category> create(@RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    Category update(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
