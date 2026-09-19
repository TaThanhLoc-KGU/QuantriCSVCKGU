import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { GalleryItem } from "../../lib/types";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Checkbox } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ImageDropzone } from "../components/ImageDropzone";
import { PlayIcon } from "../components/glyphs";

type Form = { type: "IMAGE" | "VIDEO"; title: string; url: string; sortOrder: number; active: boolean };
const emptyForm: Form = { type: "IMAGE", title: "", url: "", sortOrder: 0, active: true };

export function GalleryAdminPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<GalleryItem | null>(null);

  function load() {
    setLoading(true);
    adminApi.gallery
      .list()
      .then(setItems)
      .catch(() => setError("Không thể tải thư viện."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setForm({ type: item.type, title: item.title ?? "", url: item.url, sortOrder: item.sortOrder, active: item.active });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await adminApi.gallery.update(editing.id, form);
      else await adminApi.gallery.create(form);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.gallery.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Thư viện ảnh & video"
        description="Ảnh và video hiển thị ở cuối trang chủ. Video dán đường dẫn YouTube."
        actions={<Button onClick={openCreate}>+ Thêm mục</Button>}
      />
      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && items.length === 0 && <EmptyState title="Chưa có ảnh/video nào" />}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.type === "IMAGE" ? (
              <img src={item.url} alt="" className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-neutral-900 text-white"><PlayIcon /></div>
            )}
            <div className="p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <Badge tone={item.type === "IMAGE" ? "brand" : "accent"}>{item.type === "IMAGE" ? "Ảnh" : "Video"}</Badge>
                {!item.active && <Badge tone="neutral">Ẩn</Badge>}
              </div>
              <p className="truncate text-sm text-neutral-800">{item.title || item.url}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(item)}>
                  Sửa
                </Button>
                <Button size="sm" variant="danger" onClick={() => setToDelete(item)}>
                  Xoá
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa mục" : "Thêm mục"}>
        <div className="space-y-4">
          <Field label="Loại">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Form["type"], url: "" })} disabled={!!editing}>
              <option value="IMAGE">Ảnh</option>
              <option value="VIDEO">Video (YouTube)</option>
            </Select>
          </Field>
          <Field label="Tiêu đề / chú thích">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          {form.type === "IMAGE" ? (
            <Field label="Ảnh" required>
              <ImageDropzone value={form.url || null} onChange={(url) => setForm({ ...form, url })} folder="gallery" />
            </Field>
          ) : (
            <Field label="Đường dẫn YouTube" required hint="Ví dụ: https://www.youtube.com/watch?v=...">
              <TextInput value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </Field>
          )}
          <Field label="Thứ tự">
            <TextInput type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
          <Checkbox label="Hiển thị" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          {formError && <p className="text-sm text-urgent-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.url.trim()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog open={!!toDelete} title="Xoá mục này?" confirmLabel="Xoá" danger onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
