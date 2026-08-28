import { useEffect, useState } from "react";
import { adminApi, ApiError, type DocumentTypeRequest } from "../api";
import type { DocumentType } from "../types";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

const emptyForm: DocumentTypeRequest = { code: "", name: "", symbolCode: "", direction: "OUTGOING", resetYearly: true, sortOrder: 0, active: true };

export function DocumentTypesPage() {
  const [items, setItems] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentType | null>(null);
  const [form, setForm] = useState<DocumentTypeRequest>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<DocumentType | null>(null);

  function load() {
    setLoading(true);
    adminApi.documentTypes
      .list()
      .then((rows) => setItems([...rows].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setError("Không thể tải loại văn bản."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(t: DocumentType) {
    setEditing(t);
    setForm({ code: t.code, name: t.name, symbolCode: t.symbolCode, direction: t.direction, resetYearly: t.resetYearly, sortOrder: t.sortOrder, active: t.active });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await adminApi.documentTypes.update(editing.id, form);
      else await adminApi.documentTypes.create(form);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu loại văn bản thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.documentTypes.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá loại văn bản thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader title="Loại văn bản" description="Danh mục loại văn bản dùng để đánh số sổ văn bản." actions={<Button onClick={openCreate}>+ Thêm loại văn bản</Button>} />

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && items.length === 0 && <EmptyState title="Chưa có loại văn bản nào" />}

      {!loading && items.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Mã</th>
                <th className="px-5 py-2 font-medium">Tên</th>
                <th className="px-5 py-2 font-medium">Ký hiệu</th>
                <th className="px-5 py-2 font-medium">Hướng</th>
                <th className="px-5 py-2 font-medium">Trạng thái</th>
                <th className="px-5 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-2.5 font-mono text-xs text-neutral-700">{t.code}</td>
                  <td className="px-5 py-2.5 text-neutral-900">{t.name}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{t.symbolCode}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={t.direction === "OUTGOING" ? "brand" : "accent"}>{t.direction === "OUTGOING" ? "Văn bản đi" : "Văn bản đến"}</Badge>
                  </td>
                  <td className="px-5 py-2.5">
                    <Badge tone={t.active ? "accent" : "neutral"}>{t.active ? "Đang dùng" : "Ngừng dùng"}</Badge>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(t)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(t)}>Xoá</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa loại văn bản" : "Thêm loại văn bản"}>
        <div className="space-y-4">
          <Field label="Mã loại" required hint="Ví dụ: QD, KH, CV">
            <TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} disabled={!!editing} />
          </Field>
          <Field label="Tên loại văn bản" required>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Ký hiệu" required hint="Ví dụ: QD-QTCSVC">
            <TextInput value={form.symbolCode} onChange={(e) => setForm({ ...form, symbolCode: e.target.value })} />
          </Field>
          <Field label="Hướng văn bản" required>
            <Select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value as DocumentTypeRequest["direction"] })}>
              <option value="OUTGOING">Văn bản đi</option>
              <option value="INCOMING">Văn bản đến</option>
            </Select>
          </Field>
          <Field label="Thứ tự hiển thị">
            <TextInput type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={form.resetYearly ?? true} onChange={(e) => setForm({ ...form, resetYearly: e.target.checked })} />
            Đánh số lại từ đầu mỗi năm
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Đang sử dụng
          </label>

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !form.code.trim() || !form.name.trim() || !form.symbolCode.trim()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá loại văn bản "${toDelete?.name}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
