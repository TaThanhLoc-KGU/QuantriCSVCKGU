package com.ttloc.qtcsvc.content.internal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import static com.ttloc.qtcsvc.content.internal.PageRenderDtos.PageDetail;

@RestController
@RequestMapping("/api/public/pages")
class PublicPageController {

    private final PageRenderService service;

    PublicPageController(PageRenderService service) {
        this.service = service;
    }

    @GetMapping("/resolve")
    PageDetail resolve(@RequestParam String path) {
        return service.resolve(path);
    }

}
