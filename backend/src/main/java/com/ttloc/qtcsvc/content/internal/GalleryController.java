package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.GalleryItem;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Thu vien anh + video (link YouTube) hien o trang chu. */
@RestController
@RequestMapping("/api")
class GalleryController {

    record GalleryRequest(String type, String title, String url, Integer sortOrder, Boolean active) {
    }

    private final GalleryRepository repository;

    GalleryController(GalleryRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/public/gallery")
    List<GalleryItem> publicList() {
        return repository.findByActiveTrueOrderBySortOrderAscIdDesc();
    }

    @GetMapping("/admin/gallery")
    List<GalleryItem> adminList() {
        return repository.findAllByOrderBySortOrderAscIdDesc();
    }

    @PostMapping("/admin/gallery")
    ResponseEntity<GalleryItem> create(@RequestBody GalleryRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(build(null, req)));
    }

    @PutMapping("/admin/gallery/{id}")
    GalleryItem update(@PathVariable Long id, @RequestBody GalleryRequest req) {
        repository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy mục: " + id));
        return repository.save(build(id, req));
    }

    @DeleteMapping("/admin/gallery/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private GalleryItem build(Long id, GalleryRequest req) {
        String type = "VIDEO".equals(req.type()) ? "VIDEO" : "IMAGE";
        if (req.url() == null || req.url().isBlank()) {
            throw new IllegalArgumentException("Thiếu đường dẫn ảnh/video");
        }
        return new GalleryItem(id, type, req.title(), req.url().trim(),
                req.sortOrder() == null ? 0 : req.sortOrder(), req.active() == null || req.active());
    }

}
