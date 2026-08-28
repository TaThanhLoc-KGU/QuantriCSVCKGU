package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Post;
import com.ttloc.qtcsvc.shared.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/posts")
class PublicPostController {

    private final PostService service;

    PublicPostController(PostService service) {
        this.service = service;
    }

    @GetMapping
    PageResponse<Post> list(@RequestParam(required = false) Long category,
                             @RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "10") int size) {
        return PageResponse.from(service.publicList(category, page, size));
    }

    @GetMapping("/featured")
    List<Post> featured(@RequestParam(defaultValue = "5") int limit) {
        return service.featured(limit);
    }

    @GetMapping("/{slug}")
    Post detail(@PathVariable String slug, HttpServletRequest request) {
        Post post = service.publicDetail(slug);
        return service.registerView(post, request.getSession(true));
    }

    @GetMapping("/{slug}/related")
    List<Post> related(@PathVariable String slug, @RequestParam(defaultValue = "4") int limit) {
        Post post = service.publicDetail(slug);
        return service.related(post, limit);
    }

}
