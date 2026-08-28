import { useEffect, useState } from "react";
import { adminApi, ApiError, type NotificationRequest } from "../api";
import type { Notification } from "../../lib/types";
import { formatDate } from "../../lib/format";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { RichTextEditor } from "../components/RichTextEditor";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: NotificationRequest = {
  title: "",
  content: "",
  type: "GENERAL",
  level: "NORMAL",
  pinned: false,
  effectiveDate: today(),
  expiryDate: null,
};

export function NotificationsAdminPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [form, setForm] = useState<NotificationRequest>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Notification | null>(null);

  function load() {
    setLoading(true);
    adminApi.notifications
      .list()
      .then(setItems)
      .catch(() => setError("Không thể tải thông báo."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(n: Notification) {
    setEditing(n);
    setForm({
      title: n.title,
      content: n.content ?? "",
      type: n.type,
      level: n.level,
      pinned: n.pinned,
      effectiveDate: n.effectiveDate,
      expiryDate: n.expiryDate,
    });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await adminApi.notifications.update(editing.id, form);
      else await adminApi.notifications.create(form);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu thông báo thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.notifications.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá thông báo thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader title="Thông báo" description="Thông báo chung và thông báo mua sắm công khai." actions={<Button onClick={openCreate}>+ Thêm thông báo</Button>} />

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && items.length === 0 && <EmptyState title="Chưa có thông báo nào" />}

      {!loading && items.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Tiêu đề</th>
                <th className="px-5 py-2 font-medium">Loại</th>
                <th className="px-5 py-2 font-medium">Mức độ</th>
                <th className="px-5 py-2 font-medium">Hiệu lực</th>
                <th className="px-5 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-2.5 text-neutral-900">
                    {n.pinned && <Badge tone="brand">Ghim</Badge>} <span className="ml-1">{n.title}</span>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500">{n.type === "PROCUREMENT" ? "Mua sắm" : "Chung"}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={n.level === "URGENT" ? "urgent" : "neutral"}>{n.level === "URGENT" ? "Khẩn" : "Bình thường"}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500">{formatDate(n.effectiveDate)}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(n)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(n)}>Xoá</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa thông báo" : "Thêm thông báo"}>
        <div className="space-y-4">
          <Field label="Tiêu đề" required>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Nội dung">
            <RichTextEditor
              value={form.content ?? ""}
              onChange={(html) => setForm({ ...form, content: html })}
              placeholder="Nhập nội dung thông báo…"
              uploadFolder="notifications"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại thông báo">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as NotificationRequest["type"] })}>
                <option value="GENERAL">Chung</option>
                <option value="PROCUREMENT">Mua sắm</option>
              </Select>
            </Field>
            <Field label="Mức độ">
              <Select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as NotificationRequest["level"] })}>
                <option value="NORMAL">Bình thường</option>
                <option value="URGENT">Khẩn</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày hiệu lực" required>
              <TextInput type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
            </Field>
            <Field label="Ngày hết hạn">
              <TextInput type="date" value={form.expiryDate ?? ""} onChange={(e) => setForm({ ...form, expiryDate: e.target.value || null })} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={form.pinned ?? false} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
            Ghim thông báo này
          </label>

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.effectiveDate}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá thông báo "${toDelete?.title}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
