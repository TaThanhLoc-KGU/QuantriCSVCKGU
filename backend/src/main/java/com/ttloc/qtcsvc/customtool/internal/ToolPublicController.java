package com.ttloc.qtcsvc.customtool.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.ttloc.qtcsvc.customtool.internal.ToolService.LookupField;
import static com.ttloc.qtcsvc.customtool.internal.ToolService.PublicTool;

/** Trang cong khai cua cong cu tu tao: xem dinh nghia, gui bieu mau, tra cuu tinh trang / tra cuu bang. */
@RestController
@RequestMapping("/api/public/tools")
class ToolPublicController {

    record QueryRequest(String query) {
    }

    private final ToolService service;
    private final ObjectMapper mapper;

    ToolPublicController(ToolService service, ObjectMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    List<PublicTool> list() {
        return service.publicList();
    }

    @GetMapping("/{slug}")
    PublicTool get(@PathVariable String slug) {
        return service.publicTool(slug);
    }

    @PostMapping(value = "/{slug}/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<Map<String, String>> submit(@PathVariable String slug, @RequestParam("data") String dataJson,
                                                @RequestParam(value = "website", required = false) String honeypot,
                                                @RequestParam Map<String, MultipartFile> files) throws Exception {
        if (honeypot != null && !honeypot.isBlank()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("code", "YC-00000000", "message", "Đã ghi nhận.", "trackable", "false"));
        }
        Map<String, String> values = new HashMap<>(mapper.readValue(dataJson, new TypeReference<Map<String, String>>() {
        }));
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(slug, values, files));
    }

    @PostMapping("/{slug}/status")
    Map<String, Object> status(@PathVariable String slug, @RequestBody QueryRequest req) {
        return service.status(slug, req.query());
    }

    @PostMapping("/{slug}/lookup")
    List<LookupField> lookup(@PathVariable String slug, @RequestBody QueryRequest req) {
        return service.lookup(slug, req.query());
    }

}
