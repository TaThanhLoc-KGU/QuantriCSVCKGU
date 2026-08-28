package com.ttloc.qtcsvc.settings;

/**
 * Ten cac key co dinh trong system_settings (spec 3.5 / 9), de cac module khac
 * khong phai hardcode chuoi.
 */
public final class SettingKeys {

    private SettingKeys() {
    }

    public static final String AI_PROVIDER = "ai.provider";
    public static final String AI_API_KEY = "ai.apiKey";
    public static final String AI_MODEL = "ai.model";
    public static final String SSO_ALLOWED_DOMAINS = "sso.allowedDomains";
    public static final String ORG_NAME = "org.name";
    public static final String ORG_DEPT = "org.dept";

    public static final String SMTP_HOST = "smtp.host";
    public static final String SMTP_PORT = "smtp.port";
    public static final String SMTP_USERNAME = "smtp.username";
    public static final String SMTP_PASSWORD = "smtp.password";
    public static final String SMTP_SENDER_NAME = "smtp.senderName";
    public static final String SMTP_SENDER_EMAIL = "smtp.senderEmail";
    public static final String SMTP_USE_SSL = "smtp.useSsl";

}
