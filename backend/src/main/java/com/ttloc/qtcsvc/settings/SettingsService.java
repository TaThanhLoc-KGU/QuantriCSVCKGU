package com.ttloc.qtcsvc.settings;

import com.ttloc.qtcsvc.settings.internal.SystemSettingRepository;
import com.ttloc.qtcsvc.shared.AesCryptoService;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class SettingsService {

    private static final Set<String> SECRET_KEYS = Set.of(SettingKeys.AI_API_KEY, SettingKeys.SMTP_PASSWORD);

    private static final String UPSERT_SQL = """
            INSERT INTO system_settings (key, value, updated_by, updated_at)
            VALUES (:key, :value, :updatedBy, now())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()
            """;

    private final SystemSettingRepository repository;
    private final NamedParameterJdbcTemplate jdbcTemplate;
    private final AesCryptoService crypto;

    public SettingsService(SystemSettingRepository repository, NamedParameterJdbcTemplate jdbcTemplate, AesCryptoService crypto) {
        this.repository = repository;
        this.jdbcTemplate = jdbcTemplate;
        this.crypto = crypto;
    }

    public Optional<String> get(String key) {
        return repository.findById(key)
                .map(SystemSetting::value)
                .filter(value -> value != null && !value.isBlank())
                .map(value -> decryptIfSecret(key, value));
    }

    public String getOrDefault(String key, String defaultValue) {
        return get(key).orElse(defaultValue);
    }

    public boolean isConfigured(String key) {
        return get(key).isPresent();
    }

    public List<SettingView> listAll() {
        List<SettingView> views = new ArrayList<>();
        repository.findAll().forEach(s -> {
            boolean secret = SECRET_KEYS.contains(s.key());
            boolean configured = s.value() != null && !s.value().isBlank();
            views.add(new SettingView(s.key(), secret ? null : s.value(), secret ? configured : configured, s.updatedAt()));
        });
        return views;
    }

    /**
     * Ghi/cap nhat 1 setting. Gia tri thuoc SECRET_KEYS (vd ai.apiKey) se duoc
     * ma hoa AES truoc khi luu (khong bao gio luu plaintext).
     */
    public void put(String key, String rawValue, Long updatedByUserId) {
        String stored = (SECRET_KEYS.contains(key) && rawValue != null && !rawValue.isBlank())
                ? crypto.encrypt(rawValue)
                : rawValue;
        jdbcTemplate.update(UPSERT_SQL, new MapSqlParameterSource()
                .addValue("key", key)
                .addValue("value", stored)
                .addValue("updatedBy", updatedByUserId));
    }

    private String decryptIfSecret(String key, String value) {
        return SECRET_KEYS.contains(key) ? crypto.decrypt(value) : value;
    }

}
