package com.ttloc.qtcsvc.feedback.internal;

import com.ttloc.qtcsvc.feedback.FeedbackMessage;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
class FeedbackController {

    record SubmitRequest(String fullName, String email, String phone, String subject, String content, String website) {
    }

    record StatusRequest(String status, String adminNote) {
    }

    private final FeedbackRepository repository;

    FeedbackController(FeedbackRepository repository) {
        this.repository = repository;
    }

    @PostMapping("/public/feedback")
    ResponseEntity<Map<String, String>> submit(@RequestBody SubmitRequest req) {
        // Honeypot: bot dien o "website" thi gia vo thanh cong, khong luu.
        if (req.website() != null && !req.website().isBlank()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Cảm ơn bạn đã góp ý."));
        }
        if (isBlank(req.fullName()) || isBlank(req.subject()) || isBlank(req.content())) {
            throw new IllegalArgumentException("Vui lòng nhập họ tên, tiêu đề và nội dung góp ý.");
        }
        if (req.content().length() > 5000 || req.subject().length() > 300) {
            throw new IllegalArgumentException("Nội dung góp ý quá dài.");
        }
        repository.save(new FeedbackMessage(null, req.fullName().trim(), trim(req.email()), trim(req.phone()),
                req.subject().trim(), req.content().trim(), "MOI", null, Instant.now(), null));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Cảm ơn bạn đã góp ý. Đơn vị sẽ xem xét và phản hồi nếu cần."));
    }

    @GetMapping("/admin/feedback")
    List<FeedbackMessage> list() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PatchMapping("/admin/feedback/{id}/status")
    FeedbackMessage updateStatus(@PathVariable Long id, @RequestBody StatusRequest req) {
        FeedbackMessage m = repository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy góp ý: " + id));
        String status = "DA_XU_LY".equals(req.status()) ? "DA_XU_LY" : "MOI";
        return repository.save(new FeedbackMessage(m.id(), m.fullName(), m.email(), m.phone(), m.subject(), m.content(),
                status, req.adminNote(), m.createdAt(), "DA_XU_LY".equals(status) ? Instant.now() : null));
    }

    @DeleteMapping("/admin/feedback/{id}")
    ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }

    private static String trim(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

}
