import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { SettingView } from "../types";
import { Badge, Button, Card, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Textarea } from "../components/ui";
import { ImageDropzone } from "../components/ImageDropzone";
import { applyTheme } from "../../lib/theme";

const SENSITIVE_KEYS = new Set(["ai.apiKey", "smtp.password"]);

type Kind = "text" | "color" | "textarea" | "logo" | "radius" | "header" | "ai";
const FIELD_META: Record<string, { label: string; hint?: string; group: string; kind?: Kind }> = {
  "theme.primary": { label: "Màu chủ đạo", hint: "Dùng cho đầu trang, thanh menu, nút, liên kết. Cả thang sắc độ tự sinh từ màu này.", group: "Giao diện", kind: "color" },
  "theme.accent": { label: "Màu nhấn", hint: "Điểm nhấn phụ: dấu mục đang chọn, trạng thái hoàn thành.", group: "Giao diện", kind: "color" },
  "theme.radius": { label: "Độ bo góc", group: "Giao diện", kind: "radius" },
  "theme.header": { label: "Kiểu thanh menu", group: "Giao diện", kind: "header" },
  "site.logoUrl": { label: "Logo", hint: "Tải ảnh vuông (PNG/SVG nền trong suốt là đẹp nhất).", group: "Nhận diện", kind: "logo" },
  "site.name": { label: "Tên website / đơn vị", hint: "Hiện ở đầu trang, chân trang, tiêu đề tab.", group: "Nhận diện" },
  "site.subtitle": { label: "Dòng phụ (tên trường)", group: "Nhận diện" },
  "site.description": { label: "Mô tả ngắn", group: "Nhận diện" },
  "site.tickerLabel": { label: "Nhãn dải thông báo mới", hint: "Chữ ở đầu dải thông báo dưới thanh menu.", group: "Nhận diện" },
  "site.topLinks": { label: "Liên kết dải trên cùng", hint: "Mỗi dòng một liên kết: Nhãn | đường dẫn. Ví dụ: Sinh viên | /trang/sinh-vien", group: "Đầu trang & chân trang", kind: "textarea" },
  "site.quickLinks": { label: "Ô lối tắt ở trang chủ", hint: "Mỗi dòng: Nhãn | đường dẫn. Để trống để dùng bộ mặc định.", group: "Đầu trang & chân trang", kind: "textarea" },
  "site.footerNote": { label: "Ghi chú chân trang", group: "Đầu trang & chân trang", kind: "textarea" },
  "site.address": { label: "Địa chỉ 1", group: "Đầu trang & chân trang" },
  "site.address2": { label: "Địa chỉ 2", group: "Đầu trang & chân trang" },
  "site.phone": { label: "Điện thoại", group: "Đầu trang & chân trang" },
  "site.email": { label: "Email liên hệ", group: "Đầu trang & chân trang" },
  "site.facebook": { label: "Link Facebook", group: "Đầu trang & chân trang" },
  "site.youtube": { label: "Link YouTube", group: "Đầu trang & chân trang" },
  "site.parentUrl": { label: "Link website Trường", group: "Đầu trang & chân trang" },
  "org.name": { label: "Tên trường", group: "Thông tin đơn vị" },
  "org.dept": { label: "Tên phòng/ban", group: "Thông tin đơn vị" },
  "sso.allowedDomains": { label: "Tên miền SSO được phép", hint: "Ví dụ: vnkgu.edu.vn (phân cách bằng dấu phẩy nếu nhiều)", group: "Đăng nhập" },
  "ai.provider": { label: "Nhà cung cấp AI", hint: "Chọn “none” để tắt tính năng soạn nháp AI", group: "Trợ lý AI", kind: "ai" },
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

const DEFAULTS: Record<string, string> = {
  "theme.primary": "#1d5c94",
  "theme.accent": "#35804d",
  "theme.radius": "sharp",
  "theme.header": "solid",
  "site.logoUrl": "/logo.ico",
};

const GROUP_ORDER = ["Giao diện", "Nhận diện", "Đầu trang & chân trang", "Thông tin đơn vị", "Đăng nhập", "Trợ lý AI", "Email"];

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
          initial[key] = rows.find((s) => s.key === key)?.value ?? DEFAULTS[key] ?? "";
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

  function set(key: string, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (key.startsWith("theme.")) {
      applyTheme({
        primaryColor: next["theme.primary"] || DEFAULTS["theme.primary"],
        accentColor: next["theme.accent"] || DEFAULTS["theme.accent"],
        radius: next["theme.radius"] || "sharp",
        headerStyle: next["theme.header"] || "solid",
      });
    }
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

  function renderControl(key: string) {
    const meta = FIELD_META[key];
    const value = values[key] ?? "";
    switch (meta.kind) {
      case "color":
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#1d5c94"}
              onChange={(e) => set(key, e.target.value)}
              className="h-9 w-12 cursor-pointer border border-neutral-300 bg-white p-0.5"
              aria-label={meta.label}
            />
            <TextInput value={value} onChange={(e) => set(key, e.target.value)} className="max-w-32 font-mono" maxLength={7} />
          </div>
        );
      case "radius":
        return (
          <Select value={value || "sharp"} onChange={(e) => set(key, e.target.value)} className="max-w-xs">
            <option value="sharp">Vuông vức (mặc định)</option>
            <option value="soft">Bo nhẹ</option>
            <option value="round">Bo tròn</option>
          </Select>
        );
      case "header":
        return (
          <Select value={value || "solid"} onChange={(e) => set(key, e.target.value)} className="max-w-xs">
            <option value="solid">Nền màu chủ đạo, chữ trắng</option>
            <option value="light">Nền trắng, vạch màu chủ đạo</option>
          </Select>
        );
      case "logo":
        return <ImageDropzone value={value || null} onChange={(url) => set(key, url)} folder="branding" aspectClassName="aspect-square max-w-40" />;
      case "textarea":
        return <Textarea rows={4} value={value} onChange={(e) => set(key, e.target.value)} className="font-mono text-[13px]" />;
      case "ai":
        return (
          <Select value={value} onChange={(e) => set(key, e.target.value)} className="max-w-xs">
            <option value="none">Không dùng (none)</option>
            <option value="gemini">Google Gemini</option>
          </Select>
        );
      default: {
        const sensitive = SENSITIVE_KEYS.has(key);
        return (
          <div className="flex items-center gap-2">
            <TextInput
              type={sensitive ? "password" : "text"}
              placeholder={sensitive && configured(key) ? "•••••••• (đã cấu hình)" : undefined}
              value={value}
              onChange={(e) => set(key, e.target.value)}
            />
            {sensitive && <Badge tone={configured(key) ? "accent" : "neutral"}>{configured(key) ? "Đã cấu hình" : "Chưa cấu hình"}</Badge>}
          </div>
        );
      }
    }
  }

  const byGroup = GROUP_ORDER.map((group) => ({
    group,
    keys: Object.keys(FIELD_META).filter((key) => FIELD_META[key].group === group),
  })).filter((g) => g.keys.length > 0);

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Giao diện & cấu hình"
        description="Màu sắc, logo, đầu trang, chân trang và các thiết lập hệ thống. Đổi màu/góc bo xem trước ngay, bấm Lưu để áp dụng cho mọi người."
        actions={
          <>
            {saved && <span className="text-sm font-semibold text-accent-700">Đã lưu.</span>}
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? "Đang lưu…" : "Lưu cấu hình"}
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}
      {loading && <LoadingState />}

      {!loading && (
        <div className="space-y-5">
          {byGroup.map(({ group, keys }) => (
            <Card key={group}>
              <div className="border-b border-neutral-300 bg-neutral-100 px-4 py-2">
                <p className="text-xs font-bold uppercase tracking-[0.06em] text-neutral-800">{group}</p>
              </div>
              <div className="grid gap-x-6 gap-y-4 p-4 md:grid-cols-2">
                {keys.map((key) => {
                  const meta = FIELD_META[key];
                  const wide = meta.kind === "textarea" || meta.kind === "logo";
                  return (
                    <div key={key} className={wide ? "md:col-span-2" : undefined}>
                      <Field label={meta.label} hint={meta.hint}>
                        {renderControl(key)}
                      </Field>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
