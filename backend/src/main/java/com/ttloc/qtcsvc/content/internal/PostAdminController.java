package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Post;
import com.ttloc.qtcsvc.content.PostStatus;
import com.ttloc.qtcsvc.identity.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Quan ly bai viet. STAFF chi thay/sua bai cua minh, EDITOR/ADMIN thay tat ca
 * (spec 2.3 / 5.1) - kiem tra o PostService.
 */
@RestController
@RequestMapping("/api/admin/posts")
class PostAdminController {

    private final PostService service;
    private final CurrentUserService currentUserService;

    PostAdminController(PostService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    List<Post> list(@RequestParam(required = false) Long category,
                     @RequestParam(required = false) PostStatus status,
                     @RequestParam(required = false) Long author,
                     @RequestParam(required = false) String q) {
        return service.adminList(currentUserService.requireCurrent(), category, status, author, q);
    }

    @PostMapping
    ResponseEntity<Post> create(@RequestBody PostRequest request) {
        Post created = service.create(currentUserService.requireCurrent(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    Post update(@PathVariable Long id, @RequestBody PostRequest request) {
        return service.update(currentUserService.requireCurrent(), id, request);
    }

    @PatchMapping("/{id}/status")
    Post changeStatus(@PathVariable Long id, @RequestBody PostStatusRequest request) {
        PostRequest patch = new PostRequest(null, null, null, null, null, null, null, request.publish());
        return service.update(currentUserService.requireCurrent(), id, patch);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(currentUserService.requireCurrent(), id);
        return ResponseEntity.noContent().build();
    }

}
