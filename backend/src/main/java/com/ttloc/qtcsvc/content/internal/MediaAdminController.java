package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.MediaFile;
import com.ttloc.qtcsvc.identity.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/media")
class MediaAdminController {

    private final MediaService service;
    private final CurrentUserService currentUserService;

    MediaAdminController(MediaService service, CurrentUserService currentUserService) {
        this.service = service;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    List<MediaFile> list(@RequestParam(required = false) String folder) {
        return service.list(folder);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<MediaFile> upload(@RequestParam("file") MultipartFile file,
                                      @RequestParam(defaultValue = "misc") String folder) {
        Long userId = currentUserService.requireCurrent().id();
        return ResponseEntity.status(HttpStatus.CREATED).body(service.upload(folder, file, userId));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
