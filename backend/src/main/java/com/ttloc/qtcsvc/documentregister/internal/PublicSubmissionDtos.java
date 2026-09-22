package com.ttloc.qtcsvc.documentregister.internal;

record PublicSubmissionRequest(
        String title,
        String senderName,
        String senderOrg,
        String senderEmail,
        String senderPhone,
        String honeypot
) {
}

record PublicSubmissionResponse(String numberDisplay, String message) {
}
