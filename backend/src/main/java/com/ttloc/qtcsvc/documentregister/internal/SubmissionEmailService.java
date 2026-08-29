package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.settings.EmailSenderService;
import org.springframework.stereotype.Service;

/**
 * Gui email cho nguoi nop van ban qua form cong khai (xac nhan da nhan / bao
 * da xu ly xong). Best-effort qua EmailSenderService.sendQuietly - neu SMTP
 * chua cau hinh hoac loi, chi log canh bao, khong chan luong nop van ban.
 */
@Service
class SubmissionEmailService {

    private final EmailSenderService emailSender;

    SubmissionEmailService(EmailSenderService emailSender) {
        this.emailSender = emailSender;
    }

    void sendReceivedConfirmation(String toEmail, String numberDisplay, String title) {
        String subject = "[Đã tiếp nhận] " + title;
        String body = """
                <p>Kính gửi Quý vị,</p>
                <p>Phòng Quản trị Cơ sở vật chất — Trường Đại học Kiên Giang đã tiếp nhận văn bản của Quý vị:</p>
                <ul>
                  <li><strong>Số tiếp nhận:</strong> %s</li>
                  <li><strong>Trích yếu:</strong> %s</li>
                </ul>
                <p>Chúng tôi sẽ xử lý và phản hồi trong thời gian sớm nhất. Đây là email tự động, vui lòng không trả lời email này.</p>
                <p>Trân trọng,<br/>Phòng Quản trị Cơ sở vật chất</p>
                """.formatted(escape(numberDisplay), escape(title));
        emailSender.sendQuietly(toEmail, subject, body);
    }

    void sendProcessedNotification(String toEmail, String numberDisplay, String title) {
        String subject = "[Đã xử lý] " + title;
        String body = """
                <p>Kính gửi Quý vị,</p>
                <p>Văn bản của Quý vị đã được Phòng Quản trị Cơ sở vật chất xử lý xong:</p>
                <ul>
                  <li><strong>Số tiếp nhận:</strong> %s</li>
                  <li><strong>Trích yếu:</strong> %s</li>
                </ul>
                <p>Nếu cần trao đổi thêm, vui lòng liên hệ trực tiếp Phòng Quản trị Cơ sở vật chất. Đây là email tự động, vui lòng không trả lời email này.</p>
                <p>Trân trọng,<br/>Phòng Quản trị Cơ sở vật chất</p>
                """.formatted(escape(numberDisplay), escape(title));
        emailSender.sendQuietly(toEmail, subject, body);
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

}
