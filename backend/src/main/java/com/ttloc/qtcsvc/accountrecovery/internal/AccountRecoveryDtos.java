package com.ttloc.qtcsvc.accountrecovery.internal;

import java.time.Instant;

class AccountRecoveryDtos {

    record PublicRequest(
            String fullName,
            String email,
            String phone,
            boolean isNewStudent,
            String studentId,
            String cccdNumber,
            String classCode,
            String unitName,
            String honeypot
    ) {
    }

    record PublicResponse(String caseCode, String message) {
    }

    record StatusUpdateRequest(String status, String adminNote) {
    }

    record SendResultRequest(String subject, String body) {
    }

    record LookupRequest(String query) {
    }

    record LookupResponse(String status, String fullName, String resultMessage, Instant createdAt, Instant processedAt) {
    }

}
