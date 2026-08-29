package com.ttloc.qtcsvc.settings;

import com.ttloc.qtcsvc.shared.ExternalServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;

/**
 * Gui email dung chung, cau hinh SMTP doc dong tu Settings (khong dung
 * spring.mail.* tinh) de ADMIN doi duoc ma khong can khoi dong lai app.
 * Dung cho ca thong bao tu dong (vd van ban den) lan email admin tu soan
 * (vd ket qua khoi phuc tai khoan).
 */
@Service
public class EmailSenderService {

    private static final Logger log = LoggerFactory.getLogger(EmailSenderService.class);

    private final SettingsService settingsService;

    EmailSenderService(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    public boolean isConfigured() {
        return settingsService.get(SettingKeys.SMTP_HOST).filter(h -> !h.isBlank()).isPresent();
    }

    /**
     * Gui best-effort - neu SMTP chua cau hinh hoac loi, chi log canh bao,
     * khong nem exception (dung cho thong bao tu dong, khong duoc chan luong
     * chinh vd nop van ban).
     */
    public void sendQuietly(String toEmail, String subject, String htmlBody) {
        try {
            send(toEmail, subject, htmlBody);
        } catch (Exception e) {
            log.warn("Gui email that bai (bo qua, khong chan luong chinh) toi {}", toEmail, e);
        }
    }

    /**
     * Gui that su, nem exception neu chua cau hinh SMTP hoac gui loi - dung
     * cho hanh dong admin chu dong bam gui (can biet ngay neu that bai).
     */
    public void send(String toEmail, String subject, String htmlBody) {
        if (toEmail == null || toEmail.isBlank()) {
            throw new IllegalArgumentException("Thiếu địa chỉ email người nhận");
        }
        String host = settingsService.get(SettingKeys.SMTP_HOST).orElse(null);
        if (host == null || host.isBlank()) {
            throw new ExternalServiceException("Chưa cấu hình SMTP trong Cấu hình hệ thống");
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
        } catch (ExternalServiceException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gui email that bai toi {}", toEmail, e);
            throw new ExternalServiceException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }

}
