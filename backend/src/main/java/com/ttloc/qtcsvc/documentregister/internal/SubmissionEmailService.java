package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.settings.SettingKeys;
import com.ttloc.qtcsvc.settings.SettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

/**
 * Gui email cho nguoi nop van ban qua form cong khai (xac nhan da nhan / bao
 * da xu ly xong). Cau hinh SMTP doc dong tu Settings (khong dung
 * spring.mail.* tinh, tuong tu ReportAiService doc AI config tu DB) de ADMIN
 * doi duoc ma khong can khoi dong lai app. Neu chua cau hinh SMTP thi bo qua
 * lang le (khong chan luong nop van ban).
 */
@Service
class SubmissionEmailService {

    private static final Logger log = LoggerFactory.getLogger(SubmissionEmailService.class);

    private final SettingsService settingsService;

    SubmissionEmailService(SettingsService settingsService) {
        this.settingsService = settingsService;
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
        send(toEmail, subject, body);
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
        send(toEmail, subject, body);
    }

    private void send(String toEmail, String subject, String htmlBody) {
        if (toEmail == null || toEmail.isBlank()) return;

        String host = settingsService.get(SettingKeys.SMTP_HOST).orElse(null);
        if (host == null || host.isBlank()) {
            log.info("SMTP chua duoc cau hinh - bo qua gui email toi {}", toEmail);
            return;
        }

        try {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost(host);
            sender.setPort(Integer.parseInt(settingsService.getOrDefault(SettingKeys.SMTP_PORT, "587")));
            sender.setUsername(settingsService.getOrDefault(SettingKeys.SMTP_USERNAME, ""));
            sender.setPassword(settingsService.getOrDefault(SettingKeys.SMTP_PASSWORD, ""));
            sender.setDefaultEncoding(StandardCharsets.UTF_8.name());

            boolean useSsl = Boolean.parseBoolean(settingsService.getOrDefault(SettingKeys.SMTP_USE_SSL, "true"));
            var props = sender.getJavaMailProperties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", String.valueOf(useSsl));

            String senderEmail = settingsService.getOrDefault(SettingKeys.SMTP_SENDER_EMAIL, sender.getUsername());
            String senderName = settingsService.getOrDefault(SettingKeys.SMTP_SENDER_NAME, "Phòng Quản trị Cơ sở vật chất");

            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, StandardCharsets.UTF_8.name());
            helper.setFrom(senderEmail, senderName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            sender.send(message);
        } catch (Exception e) {
            log.error("Loi gui email toi {}", toEmail, e);
        }
    }

    private String escape(String s) {
        return s == null ? "" : s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

}
