package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.MediaFile;
import com.ttloc.qtcsvc.shared.FileStorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/media")
class PublicMediaController {

    private final MediaService service;
    private final FileStorageService storage;

    PublicMediaController(MediaService service, FileStorageService storage) {
        this.service = service;
        this.storage = storage;
    }

    @GetMapping("/{id}")
    ResponseEntity<InputStreamResource> get(@PathVariable Long id) {
        MediaFile file = service.get(id);
        InputStreamResource body = new InputStreamResource(storage.open(file.fileName()));
        MediaType contentType = file.mimeType() != null
                ? MediaType.parseMediaType(file.mimeType())
                : MediaType.APPLICATION_OCTET_STREAM;
        return ResponseEntity.ok()
                .contentType(contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.originalName() + "\"")
                .body(body);
    }

}
