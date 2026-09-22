import { useEffect, useState } from "react";
import { adminApi, ApiError, type BannerRequest } from "../api";
import type { Banner } from "../../lib/types";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, TextInput } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ImageDropzone } from "../components/ImageDropzone";

const emptyForm: BannerRequest = { title: "", imageUrl: "", linkUrl: "", sortOrder: 0, active: true, startDate: null, endDate: null };

export function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerRequest>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Banner | null>(null);

  function load() {
    setLoading(true);
    adminApi.banners
      .list()
      .then((rows) => setBanners([...rows].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setError("Không thể tải banner."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({ title: b.title, imageUrl: b.imageUrl, linkUrl: b.linkUrl ?? "", sortOrder: b.sortOrder, active: b.active, startDate: b.startDate, endDate: b.endDate });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await adminApi.banners.update(editing.id, form);
      else await adminApi.banners.create(form);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu banner thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.banners.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá banner thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader title="Banner trang chủ" description="Ảnh bìa xoay vòng hiển thị đầu trang chủ." actions={<Button onClick={openCreate}>+ Thêm banner</Button>} />

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && banners.length === 0 && <EmptyState title="Chưa có banner nào" />}

      {!loading && banners.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banners.map((b) => (
            <Card key={b.id} className="overflow-hidden">
              <img src={b.imageUrl} alt={b.title} className="h-32 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-900">{b.title}</p>
                  <Badge tone={b.active ? "accent" : "neutral"}>{b.active ? "Hiện" : "Ẩn"}</Badge>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(b)}>Sửa</Button>
                  <Button size="sm" variant="danger" onClick={() => setToDelete(b)}>Xoá</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa banner" : "Thêm banner"}>
        <div className="space-y-4">
          <Field label="Tiêu đề" required>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Ảnh banner" required hint="Ảnh được cắt theo khung 2:1 (đúng khung hiển thị ở trang chủ) — kéo và phóng to để chọn vùng đẹp nhất.">
            <ImageDropzone
              value={form.imageUrl || null}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
              folder="banners"
              aspectClassName="aspect-[2/1]"
              cropAspect={2}
              cropOutputWidth={1600}
            />
          </Field>
          <Field label="Liên kết khi bấm vào">
            <TextInput value={form.linkUrl ?? ""} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bắt đầu hiển thị">
              <TextInput type="date" value={form.startDate ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value || null })} />
            </Field>
            <Field label="Kết thúc hiển thị">
              <TextInput type="date" value={form.endDate ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value || null })} />
            </Field>
          </div>
          <Field label="Thứ tự hiển thị">
            <TextInput type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Đang hiển thị
          </label>

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim() || !form.imageUrl.trim()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá banner "${toDelete?.title}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
