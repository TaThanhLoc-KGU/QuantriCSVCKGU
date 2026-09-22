package com.ttloc.qtcsvc.settings.internal;

import com.ttloc.qtcsvc.identity.CurrentUserService;
import com.ttloc.qtcsvc.settings.SettingView;
import com.ttloc.qtcsvc.settings.SettingsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Cau hinh he thong (AI, SSO domain, ten truong/phong...) - chi ADMIN duoc
 * xem/sua (spec 2.3, 9). Gia tri nhay cam (ai.apiKey) khong bao gio tra ra
 * ngoai - xem SettingsService/SettingView.
 */
@RestController
@RequestMapping("/api/admin/settings")
@PreAuthorize("hasRole('ADMIN')")
class SettingsAdminController {

    private final SettingsService settingsService;
    private final CurrentUserService currentUserService;

    SettingsAdminController(SettingsService settingsService, CurrentUserService currentUserService) {
        this.settingsService = settingsService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    List<SettingView> list() {
        return settingsService.listAll();
    }

    @PutMapping
    List<SettingView> update(@RequestBody Map<String, String> updates) {
        Long userId = currentUserService.requireCurrent().id();
        updates.forEach((key, value) -> settingsService.put(key, value, userId));
        return settingsService.listAll();
    }

}
