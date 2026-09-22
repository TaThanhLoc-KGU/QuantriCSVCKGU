package com.ttloc.qtcsvc.documentregister.internal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Form cong khai de don vi/ca nhan ben ngoai gui van ban den (to trinh, don
 * de nghi...) toi phong - khong can dang nhap (spec: lien ket voi luong
 * tiep nhan/xu ly cong viec noi bo qua module tasks).
 */
@RestController
@RequestMapping("/api/public/document-submissions")
class PublicSubmissionController {

    private final PublicSubmissionService service;

    PublicSubmissionController(PublicSubmissionService service) {
        this.service = service;
    }

    @PostMapping
    ResponseEntity<PublicSubmissionResponse> submit(
            @RequestParam String title,
            @RequestParam String senderName,
            @RequestParam(required = false) String senderOrg,
            @RequestParam String senderEmail,
            @RequestParam(required = false) String senderPhone,
            @RequestParam(required = false, defaultValue = "") String website,
            @RequestParam(required = false) MultipartFile file) {
        var request = new PublicSubmissionRequest(title, senderName, senderOrg, senderEmail, senderPhone, website);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(request, file));
    }

}
