package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Category;
import com.ttloc.qtcsvc.content.CategoryKind;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/categories")
class PublicCategoryController {

    private final CategoryService service;

    PublicCategoryController(CategoryService service) {
        this.service = service;
    }

    @GetMapping
    List<Category> list(@RequestParam(defaultValue = "POST") CategoryKind kind) {
        return service.tree(kind);
    }

}
