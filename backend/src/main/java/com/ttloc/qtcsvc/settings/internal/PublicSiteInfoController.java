package com.ttloc.qtcsvc.settings.internal;

import com.ttloc.qtcsvc.settings.SettingKeys;
import com.ttloc.qtcsvc.settings.SettingsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Thong tin thuong hieu cua website (ten, logo, dia chi, lien he...) - cho
 * phep doi ten/thuong hieu de tai su dung he thong cho nhieu don vi. Chi
 * nhung key cong khai, khong bao gio tra secret. Gia tri mac dinh la cua
 * Phong Quan tri Co so vat chat.
 */
@RestController
@RequestMapping("/api/public/site-info")
class PublicSiteInfoController {

    private final SettingsService settings;

    PublicSiteInfoController(SettingsService settings) {
        this.settings = settings;
    }

    @GetMapping
    Map<String, String> get() {
        Map<String, String> info = new LinkedHashMap<>();
        info.put("name", settings.getOrDefault(SettingKeys.SITE_NAME, "Phòng Quản trị Cơ sở vật chất"));
        info.put("subtitle", settings.getOrDefault(SettingKeys.SITE_SUBTITLE, "Trường Đại học Kiên Giang"));
        info.put("logoUrl", settings.getOrDefault(SettingKeys.SITE_LOGO_URL, "/logo.ico"));
        info.put("address", settings.getOrDefault(SettingKeys.SITE_ADDRESS, "Tầng 7, Nhà Điều hành, Trường Đại học Kiên Giang"));
        info.put("address2", settings.getOrDefault(SettingKeys.SITE_ADDRESS_2, "320A, Quốc lộ 61, Xã Châu Thành, Tỉnh An Giang"));
        info.put("phone", settings.getOrDefault(SettingKeys.SITE_PHONE, ""));
        info.put("email", settings.getOrDefault(SettingKeys.SITE_EMAIL, "qtcsvc@vnkgu.edu.vn"));
        info.put("facebook", settings.getOrDefault(SettingKeys.SITE_FACEBOOK, ""));
        info.put("youtube", settings.getOrDefault(SettingKeys.SITE_YOUTUBE, ""));
        info.put("parentUrl", settings.getOrDefault(SettingKeys.SITE_PARENT_URL, "https://vnkgu.edu.vn/"));
        info.put("description", settings.getOrDefault(SettingKeys.SITE_DESCRIPTION,
                "Cổng thông tin Phòng Quản trị Cơ sở vật chất - Trường Đại học Kiên Giang."));
        info.put("primaryColor", settings.getOrDefault(SettingKeys.THEME_PRIMARY, "#1d5c94"));
        info.put("accentColor", settings.getOrDefault(SettingKeys.THEME_ACCENT, "#35804d"));
        info.put("radius", settings.getOrDefault(SettingKeys.THEME_RADIUS, "sharp"));
        info.put("headerStyle", settings.getOrDefault(SettingKeys.THEME_HEADER, "solid"));
        info.put("topLinks", settings.getOrDefault(SettingKeys.SITE_TOP_LINKS, ""));
        info.put("quickLinks", settings.getOrDefault(SettingKeys.SITE_QUICK_LINKS, ""));
        info.put("footerNote", settings.getOrDefault(SettingKeys.SITE_FOOTER_NOTE, ""));
        info.put("tickerLabel", settings.getOrDefault(SettingKeys.SITE_TICKER_LABEL, "Thông báo mới"));
        return info;
    }

}
