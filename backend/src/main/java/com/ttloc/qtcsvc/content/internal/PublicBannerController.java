package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Banner;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/banners")
class PublicBannerController {

    private final BannerService service;

    PublicBannerController(BannerService service) {
        this.service = service;
    }

    @GetMapping
    List<Banner> list() {
        return service.publicList();
    }

}
