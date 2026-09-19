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

    public static final String SITE_NAME = "site.name";
    public static final String SITE_SUBTITLE = "site.subtitle";
    public static final String SITE_LOGO_URL = "site.logoUrl";
    public static final String SITE_ADDRESS = "site.address";
    public static final String SITE_ADDRESS_2 = "site.address2";
    public static final String SITE_PHONE = "site.phone";
    public static final String SITE_EMAIL = "site.email";
    public static final String SITE_FACEBOOK = "site.facebook";
    public static final String SITE_YOUTUBE = "site.youtube";
    public static final String SITE_PARENT_URL = "site.parentUrl";
    public static final String SITE_DESCRIPTION = "site.description";

    public static final String SMTP_HOST = "smtp.host";
    public static final String SMTP_PORT = "smtp.port";
    public static final String SMTP_USERNAME = "smtp.username";
    public static final String SMTP_PASSWORD = "smtp.password";
    public static final String SMTP_SENDER_NAME = "smtp.senderName";
    public static final String SMTP_SENDER_EMAIL = "smtp.senderEmail";
    public static final String SMTP_USE_SSL = "smtp.useSsl";

}
