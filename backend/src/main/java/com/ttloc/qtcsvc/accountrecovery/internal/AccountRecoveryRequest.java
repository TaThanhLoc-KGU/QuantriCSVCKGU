package com.ttloc.qtcsvc.accountrecovery.internal;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.Instant;

/**
 * Yeu cau khoi phuc tai khoan he thong (sinh vien/tan sinh vien gui qua form
 * cong khai). Phong xu ly thu cong dua vao thong tin + anh dinh kem, khong
 * tu dong doi mat khau (khong lien quan module identity/users).
 */
@Table("account_recovery_requests")
public record AccountRecoveryRequest(
        @Id Long id,
        String caseCode,
        String fullName,
        String email,
        String phone,
        boolean isNewStudent,
        String studentId,
        String cccdNumber,
        String classCode,
        String unitName,
        String screenshotUrl,
        String screenshotName,
        String idCardUrl,
        String idCardName,
        String status,
        String adminNote,
        String resultMessage,
        Instant createdAt,
        Instant processedAt,
        Long processedBy
) {

    public static final String STATUS_NEW = "MOI";
    public static final String STATUS_DONE = "DA_XU_LY";
    public static final String STATUS_REJECTED = "TU_CHOI";

}
