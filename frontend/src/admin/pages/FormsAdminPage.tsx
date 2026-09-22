import { useEffect, useState } from "react";
import { adminApi, ApiError, type FormRequest } from "../api";
import type { Category, Form } from "../../lib/types";
import { formatDate } from "../../lib/format";
import { Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Textarea } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface FormFormState {
  title: string;
  description: string;
  categoryId: number | null;
  version: string;
  active: boolean;
}

const emptyForm: FormFormState = { title: "", description: "", categoryId: null, version: "", active: true };

export function FormsAdminPage() {
  const [items, setItems] = useState<Form[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Form | null>(null);
  const [form, setForm] = useState<FormFormState>(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Form | null>(null);

  function load() {
    setLoading(true);
    Promise.all([adminApi.forms.list(), adminApi.categories.list("FORM")])
      .then(([f, c]) => {
        setItems(f);
        setCategories(c);
      })
      .catch(() => setError("Không thể tải biểu mẫu."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function categoryName(id: number) {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? null });
    setFile(null);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(f: Form) {
    setEditing(f);
    setForm({ title: f.title, description: f.description ?? "", categoryId: f.categoryId, version: f.version ?? "", active: f.active });
    setFile(null);
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!form.categoryId) {
      setFormError("Vui lòng chọn danh mục.");
      return;
    }
    if (!editing && !file) {
      setFormError("Vui lòng chọn tệp biểu mẫu để tải lên.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      let fileId = editing?.fileId;
      if (file) {
        const uploaded = await adminApi.media.upload(file, "forms");
        fileId = uploaded.id;
      }
      const body: FormRequest = {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        fileId: fileId!,
        version: form.version,
        active: form.active,
      };
      if (editing) await adminApi.forms.update(editing.id, body);
      else await adminApi.forms.create(body);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu biểu mẫu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.forms.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá biểu mẫu thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader title="Biểu mẫu" description="Biểu mẫu dùng chung để tải xuống." actions={<Button onClick={openCreate}>+ Thêm biểu mẫu</Button>} />

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && items.length === 0 && <EmptyState title="Chưa có biểu mẫu nào" />}

      {!loading && items.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Tên biểu mẫu</th>
                <th className="px-5 py-2 font-medium">Danh mục</th>
                <th className="px-5 py-2 font-medium">Phiên bản</th>
                <th className="px-5 py-2 font-medium">Lượt tải</th>
                <th className="px-5 py-2 font-medium">Cập nhật</th>
                <th className="px-5 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-2.5 text-neutral-900">{f.title}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{categoryName(f.categoryId)}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{f.version || "—"}</td>
                  <td className="px-5 py-2.5 text-neutral-500 tabular-nums">{f.downloadCount}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{formatDate(f.updatedAt)}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(f)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(f)}>Xoá</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa biểu mẫu" : "Thêm biểu mẫu"}>
        <div className="space-y-4">
          <Field label="Tên biểu mẫu" required>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Danh mục" required>
            <Select value={form.categoryId ?? ""} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Phiên bản" hint="Ví dụ: v2026">
            <TextInput value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
          </Field>
          <Field label={editing ? "Thay tệp mới (tuỳ chọn)" : "Tệp biểu mẫu"} required={!editing}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Đang hiển thị
          </label>

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá biểu mẫu "${toDelete?.title}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
