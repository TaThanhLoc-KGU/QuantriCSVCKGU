package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Post;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/search")
class PublicSearchController {

    private final PostService service;

    PublicSearchController(PostService service) {
        this.service = service;
    }

    @GetMapping
    List<Post> search(@RequestParam String q, @RequestParam(defaultValue = "20") int limit) {
        return service.search(q, limit);
    }

}
