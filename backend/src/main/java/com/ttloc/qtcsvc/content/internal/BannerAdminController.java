package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Banner;
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

@RestController
@RequestMapping("/api/admin/banners")
@PreAuthorize("hasAnyRole('EDITOR','ADMIN')")
class BannerAdminController {

    private final BannerService service;

    BannerAdminController(BannerService service) {
        this.service = service;
    }

    @GetMapping
    List<Banner> list() {
        return service.listAll();
    }

    @PostMapping
    ResponseEntity<Banner> create(@RequestBody BannerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @PutMapping("/{id}")
    Banner update(@PathVariable Long id, @RequestBody BannerRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
