package com.ttloc.qtcsvc.accountrecovery.internal;

import com.ttloc.qtcsvc.identity.CurrentUser;
import com.ttloc.qtcsvc.settings.EmailSenderService;
import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.shared.StoredObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Tiep nhan yeu cau khoi phuc tai khoan qua form cong khai - khong tu dong
 * doi mat khau, chi luu lai thong tin + anh dinh kem de phong xu ly thu cong
 * (xac minh danh tinh qua CCCD/the sinh vien). Nguoi gui co the tra cuu ket
 * qua qua web (ma ho so + CCCD + SDT + MSSV) hoac qua email admin gui.
 */
@Service
class AccountRecoveryService {

    private static final Logger log = LoggerFactory.getLogger(AccountRecoveryService.class);
    private static final Set<String> VALID_STATUSES = Set.of(
            AccountRecoveryRequest.STATUS_NEW, AccountRecoveryRequest.STATUS_DONE, AccountRecoveryRequest.STATUS_REJECTED);
    // Khong dung 0/O/1/I de tranh nham lan khi nguoi dung tu chep tay ma ho so.
    private static final String CASE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AccountRecoveryRequestRepository repository;
    private final FileStorageService fileStorage;
    private final EmailSenderService emailSender;

    AccountRecoveryService(AccountRecoveryRequestRepository repository, FileStorageService fileStorage, EmailSenderService emailSender) {
        this.repository = repository;
        this.fileStorage = fileStorage;
        this.emailSender = emailSender;
    }

    AccountRecoveryDtos.PublicResponse submit(AccountRecoveryDtos.PublicRequest request, MultipartFile screenshot, MultipartFile idCard) {
        if (request.honeypot() != null && !request.honeypot().isBlank()) {
            return new AccountRecoveryDtos.PublicResponse(null, "Đã gửi thành công.");
        }
        validate(request, screenshot, idCard);

        String screenshotUrl = null;
        String screenshotName = null;
        String idCardUrl = null;
        String idCardName = null;

        if (request.isNewStudent() && screenshot != null && !screenshot.isEmpty()) {
            StoredObject stored = upload(screenshot);
            if (stored != null) {
                screenshotUrl = stored.objectKey();
                screenshotName = stored.originalName();
            }
        }
        if (!request.isNewStudent() && idCard != null && !idCard.isEmpty()) {
            StoredObject stored = upload(idCard);
            if (stored != null) {
                idCardUrl = stored.objectKey();
                idCardName = stored.originalName();
            }
        }

        String caseCode = generateCaseCode();
        AccountRecoveryRequest toSave = new AccountRecoveryRequest(null, caseCode,
                request.fullName().trim(), request.email().trim(), request.phone().trim(), request.isNewStudent(), request.studentId().trim(),
                request.cccdNumber().trim(), blankToNull(request.classCode()), blankToNull(request.unitName()),
                screenshotUrl, screenshotName, idCardUrl, idCardName,
                AccountRecoveryRequest.STATUS_NEW, null, null, Instant.now(), null, null);
        repository.save(toSave);

        return new AccountRecoveryDtos.PublicResponse(caseCode,
                "Đã tiếp nhận yêu cầu khôi phục tài khoản của bạn. Mã hồ sơ: " + caseCode
                        + " — vui lòng lưu lại để tra cứu kết quả sau này.");
    }

    AccountRecoveryDtos.LookupResponse lookup(AccountRecoveryDtos.LookupRequest request) {
        if (isBlank(request.query())) {
            throw new IllegalArgumentException("Vui lòng nhập mã hồ sơ, mã số sinh viên, số điện thoại hoặc số CCCD");
        }
        AccountRecoveryRequest r = repository.findFirstByAnyIdentifier(request.query().trim())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ nào khớp với thông tin đã nhập. Vui lòng kiểm tra lại."));
        return new AccountRecoveryDtos.LookupResponse(r.status(), r.fullName(), r.resultMessage(), r.createdAt(), r.processedAt());
    }

    List<AccountRecoveryRequest> list() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    AccountRecoveryRequest get(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy yêu cầu khôi phục tài khoản: " + id));
    }

    AccountRecoveryRequest updateStatus(CurrentUser actor, Long id, AccountRecoveryDtos.StatusUpdateRequest body) {
        if (body.status() == null || !VALID_STATUSES.contains(body.status())) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + body.status());
        }
        AccountRecoveryRequest current = get(id);
        AccountRecoveryRequest updated = withStatus(current, body.status(), blankToNull(body.adminNote()), current.resultMessage(), actor.id());
        return repository.save(updated);
    }

    /**
     * Admin tu soan noi dung ket qua: gui email NGAY, luu lai noi dung do de
     * hien thi qua trang tra cuu web, va tu dong chuyen trang thai sang "Da
     * xu ly" (neu chua) - gop lam 1 hanh dong duy nhat ("tra ket qua").
     */
    AccountRecoveryRequest sendResult(CurrentUser actor, Long id, AccountRecoveryDtos.SendResultRequest body) {
        AccountRecoveryRequest current = get(id);
        if (current.email() == null || current.email().isBlank()) {
            throw new IllegalArgumentException("Yêu cầu này không có email để gửi kết quả");
        }
        if (body.subject() == null || body.subject().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập tiêu đề email");
        }
        if (body.body() == null || body.body().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập nội dung email");
        }
        // Noi dung do admin tu soan (plain text) - chuyen xuong dong thanh <br/> de hien thi dung trong email HTML.
        String html = escape(body.body()).replace("\n", "<br/>");
        emailSender.send(current.email(), body.subject().trim(), html);

        String newStatus = AccountRecoveryRequest.STATUS_DONE.equals(current.status()) || AccountRecoveryRequest.STATUS_REJECTED.equals(current.status())
                ? current.status() : AccountRecoveryRequest.STATUS_DONE;
        AccountRecoveryRequest updated = withStatus(current, newStatus, current.adminNote(), body.body().trim(), actor.id());
        return repository.save(updated);
    }

    private AccountRecoveryRequest withStatus(AccountRecoveryRequest current, String status, String adminNote, String resultMessage, Long processedBy) {
        return new AccountRecoveryRequest(current.id(), current.caseCode(), current.fullName(), current.email(), current.phone(), current.isNewStudent(),
                current.studentId(), current.cccdNumber(), current.classCode(), current.unitName(),
                current.screenshotUrl(), current.screenshotName(), current.idCardUrl(), current.idCardName(),
                status, adminNote, resultMessage, current.createdAt(), Instant.now(), processedBy);
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private String generateCaseCode() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("KP-");
            for (int i = 0; i < 8; i++) {
                sb.append(CASE_CODE_ALPHABET.charAt(RANDOM.nextInt(CASE_CODE_ALPHABET.length())));
            }
            code = sb.toString();
        } while (repository.existsByCaseCode(code));
        return code;
    }

    private StoredObject upload(MultipartFile file) {
        try {
            return fileStorage.upload("account-recovery", file.getOriginalFilename(), file.getContentType(),
                    file.getInputStream(), file.getSize());
        } catch (IOException | RuntimeException e) {
            log.warn("Khong the luu file dinh kem cho yeu cau khoi phuc tai khoan", e);
            return null;
        }
    }

    private void validate(AccountRecoveryDtos.PublicRequest request, MultipartFile screenshot, MultipartFile idCard) {
        if (request.fullName() == null || request.fullName().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập họ và tên");
        }
        if (request.email() == null || request.email().isBlank() || !request.email().contains("@")) {
            throw new IllegalArgumentException("Vui lòng nhập địa chỉ email hợp lệ để nhận kết quả");
        }
        if (request.phone() == null || request.phone().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập số điện thoại");
        }
        if (request.cccdNumber() == null || request.cccdNumber().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập số căn cước công dân");
        }
        if (request.studentId() == null || request.studentId().isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập mã số sinh viên");
        }
        if (request.isNewStudent()) {
            if (screenshot == null || screenshot.isEmpty()) {
                throw new IllegalArgumentException("Vui lòng đính kèm ảnh chụp màn hình trang tân sinh viên");
            }
        } else {
            if (request.classCode() == null || request.classCode().isBlank()) {
                throw new IllegalArgumentException("Vui lòng chọn lớp");
            }
            if (request.unitName() == null || request.unitName().isBlank()) {
                throw new IllegalArgumentException("Vui lòng chọn khoa");
            }
            if (idCard == null || idCard.isEmpty()) {
                throw new IllegalArgumentException("Vui lòng đính kèm ảnh CCCD hoặc thẻ sinh viên");
            }
        }
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

}
