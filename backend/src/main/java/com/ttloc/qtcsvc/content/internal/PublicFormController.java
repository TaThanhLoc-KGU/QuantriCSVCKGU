package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Form;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/forms")
class PublicFormController {

    private final FormService service;

    PublicFormController(FormService service) {
        this.service = service;
    }

    @GetMapping
    List<Form> list(@RequestParam(required = false) Long category, @RequestParam(required = false) String q) {
        return service.publicList(category, q);
    }

    @GetMapping("/{id}/download")
    ResponseEntity<InputStreamResource> download(@PathVariable Long id) {
        FormService.DownloadPayload payload = service.download(id);
        MediaType contentType = payload.contentType() != null
                ? MediaType.parseMediaType(payload.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + payload.fileName() + "\"")
                .body(new InputStreamResource(payload.stream()));
    }

}
