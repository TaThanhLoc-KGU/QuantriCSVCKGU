package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.DocumentNumber;
import com.ttloc.qtcsvc.documentregister.DocumentType;
import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.shared.StoredObject;
import com.ttloc.qtcsvc.tasks.TaskCreationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Tiep nhan van ban den qua form cong khai (khong dang nhap): tu cap so vao
 * So van ban den (loai DN_DEN), tu tao 1 Nhiem vu chung phong de theo doi,
 * va gui email xac nhan da nhan. Nguoi tao (createdBy) dung tai khoan ADMIN
 * he thong (id=1) vi day la hanh dong tu dong, khong co nguoi dang nhap.
 */
@Service
class PublicSubmissionService {

    private static final Logger log = LoggerFactory.getLogger(PublicSubmissionService.class);
    private static final long SYSTEM_USER_ID = 1L;

    private final DocumentNumberRepository documentNumberRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final TaskCreationService taskCreationService;
    private final FileStorageService fileStorage;
    private final SubmissionEmailService emailService;

    PublicSubmissionService(DocumentNumberRepository documentNumberRepository, DocumentTypeRepository documentTypeRepository,
                             TaskCreationService taskCreationService, FileStorageService fileStorage,
                             SubmissionEmailService emailService) {
        this.documentNumberRepository = documentNumberRepository;
        this.documentTypeRepository = documentTypeRepository;
        this.taskCreationService = taskCreationService;
        this.fileStorage = fileStorage;
        this.emailService = emailService;
    }

    PublicSubmissionResponse submit(PublicSubmissionRequest request, MultipartFile file) {
        if (request.honeypot() != null && !request.honeypot().isBlank()) {
            // Bot dien vao truong an - gia vo thanh cong, khong ghi gi ca.
            return new PublicSubmissionResponse("", "Đã gửi thành công.");
        }
        validate(request);

        DocumentType type = documentTypeRepository.findByCode("DN_DEN")
                .orElseThrow(() -> new NotFoundException("Chua cau hinh loai van ban tiep nhan (DN_DEN)"));

        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int numberInt = documentNumberRepository.findMaxNumberInt(type.id(), year) + 1;
        String numberDisplay = String.format("%02d/%s", numberInt, type.symbolCode());

        String attachmentUrl = null;
        String attachmentName = null;
        if (file != null && !file.isEmpty()) {
            try {
                StoredObject stored = fileStorage.upload("submissions", file.getOriginalFilename(),
                        file.getContentType(), file.getInputStream(), file.getSize());
                attachmentUrl = stored.objectKey();
                attachmentName = stored.originalName();
            } catch (IOException | RuntimeException e) {
                log.warn("Khong the luu file dinh kem cho don nop cong khai (tiep tuc khong co file)", e);
            }
        }

        DocumentNumber toSave = new DocumentNumber(null, type.id(), year, numberInt, numberDisplay,
                request.title().trim(), request.senderName().trim(), today, null,
                blankToNull(request.senderOrg()), null, today, SYSTEM_USER_ID, Instant.now(),
                request.senderEmail().trim(), blankToNull(request.senderPhone()), attachmentUrl, attachmentName, null);
        DocumentNumber saved = documentNumberRepository.save(toSave);

        var task = taskCreationService.createSystemDeptTask(
                "[Văn bản đến " + numberDisplay + "] " + request.title().trim(),
                buildTaskDescription(request));
        DocumentNumber linked = new DocumentNumber(saved.id(), saved.documentTypeId(), saved.year(), saved.numberInt(),
                saved.numberDisplay(), saved.title(), saved.person(), saved.issueDate(), saved.note(),
                saved.senderUnit(), saved.originalRef(), saved.receivedDate(), saved.createdBy(), saved.createdAt(),
                saved.senderEmail(), saved.senderPhone(), saved.attachmentUrl(), saved.attachmentName(), task.id());
        documentNumberRepository.save(linked);

        emailService.sendReceivedConfirmation(request.senderEmail().trim(), numberDisplay, request.title().trim());

        return new PublicSubmissionResponse(numberDisplay,
                "Đã tiếp nhận văn bản của Quý vị, số " + numberDisplay + ". Chúng tôi sẽ liên hệ nếu cần thêm thông tin.");
    }

    private String buildTaskDescription(PublicSubmissionRequest request) {
        StringBuilder sb = new StringBuilder();
        sb.append("Văn bản nộp qua trang công khai.\n");
        sb.append("Người gửi: ").append(request.senderName().trim());
        if (request.senderOrg() != null && !request.senderOrg().isBlank()) {
            sb.append(" (").append(request.senderOrg().trim()).append(")");
        }
        sb.append("\nEmail: ").append(request.senderEmail().trim());
        if (request.senderPhone() != null && !request.senderPhone().isBlank()) {
            sb.append("\nĐiện thoại: ").append(request.senderPhone().trim());
        }
        return sb.toString();
    }

    private void validate(PublicSubmissionRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Vui long nhap tieu de / trich yeu van ban");
        }
        if (request.senderName() == null || request.senderName().isBlank()) {
            throw new IllegalArgumentException("Vui long nhap ho ten nguoi gui");
        }
        if (request.senderEmail() == null || request.senderEmail().isBlank() || !request.senderEmail().contains("@")) {
            throw new IllegalArgumentException("Vui long nhap dia chi email hop le");
        }
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

}
