package com.ttloc.qtcsvc.accountrecovery.internal;

import com.ttloc.qtcsvc.identity.CurrentUserService;
import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.FileTypeSupport;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/account-recovery")
class AccountRecoveryAdminController {

    private final AccountRecoveryService service;
    private final CurrentUserService currentUserService;
    private final FileStorageService fileStorage;

    AccountRecoveryAdminController(AccountRecoveryService service, CurrentUserService currentUserService, FileStorageService fileStorage) {
        this.service = service;
        this.currentUserService = currentUserService;
        this.fileStorage = fileStorage;
    }

    @GetMapping
    List<AccountRecoveryRequest> list() {
        return service.list();
    }

    @PatchMapping("/{id}/status")
    AccountRecoveryRequest updateStatus(@PathVariable Long id, @RequestBody AccountRecoveryDtos.StatusUpdateRequest body) {
        return service.updateStatus(currentUserService.requireCurrent(), id, body);
    }

    @PostMapping("/{id}/send-result")
    AccountRecoveryRequest sendResult(@PathVariable Long id, @RequestBody AccountRecoveryDtos.SendResultRequest body) {
        return service.sendResult(currentUserService.requireCurrent(), id, body);
    }

    @GetMapping("/{id}/screenshot")
    ResponseEntity<InputStreamResource> screenshot(@PathVariable Long id) {
        AccountRecoveryRequest r = service.get(id);
        return serve(r.screenshotUrl(), r.screenshotName());
    }

    @GetMapping("/{id}/id-card")
    ResponseEntity<InputStreamResource> idCard(@PathVariable Long id) {
        AccountRecoveryRequest r = service.get(id);
        return serve(r.idCardUrl(), r.idCardName());
    }

    private ResponseEntity<InputStreamResource> serve(String objectKey, String originalName) {
        if (objectKey == null) {
            return ResponseEntity.notFound().build();
        }
        InputStreamResource body = new InputStreamResource(fileStorage.open(objectKey));
        String filename = originalName != null ? originalName : "dinh-kem";
        var inlineType = FileTypeSupport.inlineMediaType(filename);
        MediaType mediaType = inlineType.orElse(MediaType.APPLICATION_OCTET_STREAM);
        String disposition = inlineType.isPresent() ? "inline" : "attachment";
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + filename + "\"")
                .body(body);
    }

}
