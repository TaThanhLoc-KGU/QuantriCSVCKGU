import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { SettingView } from "../types";
import { Badge, Button, Card, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput } from "../components/ui";

const SENSITIVE_KEYS = new Set(["ai.apiKey", "smtp.password"]);

const FIELD_META: Record<string, { label: string; hint?: string; group: string }> = {
  "site.name": { label: "Tên website / đơn vị", hint: "Hiện ở đầu trang và chân trang. Đổi để dùng cho đơn vị khác.", group: "Thương hiệu website" },
  "site.subtitle": { label: "Dòng phụ (tên trường)", group: "Thương hiệu website" },
  "site.logoUrl": { label: "Đường dẫn logo", hint: "Ví dụ: /logo.ico hoặc URL ảnh đã tải lên", group: "Thương hiệu website" },
  "site.description": { label: "Mô tả ngắn", group: "Thương hiệu website" },
  "site.address": { label: "Địa chỉ 1", group: "Thương hiệu website" },
  "site.address2": { label: "Địa chỉ 2", group: "Thương hiệu website" },
  "site.phone": { label: "Điện thoại", group: "Thương hiệu website" },
  "site.email": { label: "Email liên hệ", group: "Thương hiệu website" },
  "site.facebook": { label: "Link Facebook", group: "Thương hiệu website" },
  "site.youtube": { label: "Link YouTube", group: "Thương hiệu website" },
  "site.parentUrl": { label: "Link website Trường", group: "Thương hiệu website" },
  "org.name": { label: "Tên trường", group: "Thông tin đơn vị" },
  "org.dept": { label: "Tên phòng/ban", group: "Thông tin đơn vị" },
  "sso.allowedDomains": { label: "Tên miền SSO được phép", hint: "Ví dụ: vnkgu.edu.vn (phân cách bằng dấu phẩy nếu nhiều)", group: "Đăng nhập" },
  "ai.provider": { label: "Nhà cung cấp AI", hint: "Chọn “none” để tắt tính năng soạn nháp AI", group: "Trợ lý AI" },
  "ai.apiKey": { label: "API key", hint: "Để trống nếu không muốn thay đổi", group: "Trợ lý AI" },
  "ai.model": { label: "Model", hint: "Ví dụ: gemini-2.5-flash", group: "Trợ lý AI" },
  "smtp.host": { label: "Máy chủ SMTP", hint: "Ví dụ: smtp.gmail.com", group: "Email" },
  "smtp.port": { label: "Cổng SMTP", hint: "Ví dụ: 587", group: "Email" },
  "smtp.username": { label: "Tên đăng nhập SMTP", group: "Email" },
  "smtp.password": { label: "Mật khẩu SMTP", hint: "Để trống nếu không muốn thay đổi", group: "Email" },
  "smtp.senderName": { label: "Tên người gửi", hint: "Ví dụ: Phòng Quản trị Cơ sở vật chất", group: "Email" },
  "smtp.senderEmail": { label: "Email người gửi", group: "Email" },
  "smtp.useSsl": { label: "Dùng TLS/SSL", hint: "true hoặc false", group: "Email" },
};

const GROUP_ORDER = ["Thương hiệu website", "Thông tin đơn vị", "Đăng nhập", "Trợ lý AI", "Email"];

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingView[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function load() {
    setLoading(true);
    adminApi.settings
      .list()
      .then((rows) => {
        setSettings(rows);
        const initial: Record<string, string> = {};
        for (const key of Object.keys(FIELD_META)) {
          if (SENSITIVE_KEYS.has(key)) continue;
          initial[key] = rows.find((s) => s.key === key)?.value ?? "";
        }
        setValues(initial);
      })
      .catch(() => setError("Không thể tải cấu hình hệ thống."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function configured(key: string) {
    return settings.find((s) => s.key === key)?.configured ?? false;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const payload: Record<string, string> = { ...values };
    for (const key of SENSITIVE_KEYS) {
      if (!payload[key]?.trim()) delete payload[key];
    }
    try {
      const rows = await adminApi.settings.update(payload);
      setSettings(rows);
      setValues((v) => {
        const next = { ...v };
        for (const key of SENSITIVE_KEYS) next[key] = "";
        return next;
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu cấu hình thất bại.");
    } finally {
      setSaving(false);
    }
  }

  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    keys: Object.keys(FIELD_META).filter((key) => FIELD_META[key].group === group),
  })).filter((g) => g.keys.length > 0);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Cấu hình hệ thống" description="Thông tin đơn vị, đăng nhập SSO và trợ lý AI." />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {loading && <LoadingState />}

      {!loading && (
        <div className="space-y-6">
          {byGroup.map(({ group, keys }) => (
            <Card key={group} className="p-5">
              <p className="mb-4 text-sm font-semibold text-neutral-900">{group}</p>
              <div className="space-y-4">
                {keys.map((key) => {
                  const meta = FIELD_META[key];
                  const isSensitive = SENSITIVE_KEYS.has(key);
                  return (
                    <Field key={key} label={meta?.label ?? key} hint={meta?.hint}>
                      {key === "ai.provider" ? (
                        <Select value={values[key] ?? ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })}>
                          <option value="none">Không dùng (none)</option>
                          <option value="gemini">Google Gemini</option>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <TextInput
                            type={isSensitive ? "password" : "text"}
                            placeholder={isSensitive && configured(key) ? "•••••••• (đã cấu hình)" : undefined}
                            value={isSensitive ? values[key] ?? "" : values[key] ?? ""}
                            onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                          />
                          {isSensitive && (
                            <Badge tone={configured(key) ? "accent" : "neutral"}>{configured(key) ? "Đã cấu hình" : "Chưa cấu hình"}</Badge>
                          )}
                        </div>
                      )}
                    </Field>
                  );
                })}
              </div>
            </Card>
          ))}

          <div className="flex items-center justify-end gap-3">
            {saved && <span className="text-sm text-accent-700">Đã lưu.</span>}
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu cấu hình"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
