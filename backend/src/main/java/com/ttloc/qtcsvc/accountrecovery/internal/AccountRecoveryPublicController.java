package com.ttloc.qtcsvc.accountrecovery.internal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/public/account-recovery")
class AccountRecoveryPublicController {

    private final AccountRecoveryService service;

    AccountRecoveryPublicController(AccountRecoveryService service) {
        this.service = service;
    }

    @PostMapping
    ResponseEntity<AccountRecoveryDtos.PublicResponse> submit(
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String phone,
            @RequestParam boolean isNewStudent,
            @RequestParam String studentId,
            @RequestParam String cccdNumber,
            @RequestParam(required = false) String classCode,
            @RequestParam(required = false) String unitName,
            @RequestParam(required = false, defaultValue = "") String website,
            @RequestParam(required = false) MultipartFile screenshot,
            @RequestParam(required = false) MultipartFile idCard) {
        var request = new AccountRecoveryDtos.PublicRequest(fullName, email, phone, isNewStudent, studentId, cccdNumber, classCode, unitName, website);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.submit(request, screenshot, idCard));
    }

    @PostMapping("/lookup")
    AccountRecoveryDtos.LookupResponse lookup(@RequestBody AccountRecoveryDtos.LookupRequest request) {
        return service.lookup(request);
    }

}
