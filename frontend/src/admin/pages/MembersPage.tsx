import { useEffect, useState } from "react";
import { adminApi, ApiError, type MemberRequest } from "../api";
import type { Member } from "../types";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, TextInput } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

const emptyForm: MemberRequest = { name: "", position: "", email: "", phone: "", active: true, sortOrder: 0 };

export function MembersPage() {
  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberRequest>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Member | null>(null);

  function load() {
    setLoading(true);
    adminApi.members
      .list()
      .then((rows) => setItems([...rows].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setError("Không thể tải danh sách nhân sự."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(m: Member) {
    setEditing(m);
    setForm({ name: m.name, position: m.position ?? "", email: m.email ?? "", phone: m.phone ?? "", active: m.active, sortOrder: m.sortOrder });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) await adminApi.members.update(editing.id, form);
      else await adminApi.members.create(form);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu nhân sự thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.members.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá nhân sự thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader title="Nhân sự" description="Danh sách nhân sự của phòng, dùng để phân công nhiệm vụ." actions={<Button onClick={openCreate}>+ Thêm nhân sự</Button>} />

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && items.length === 0 && <EmptyState title="Chưa có nhân sự nào" />}

      {!loading && items.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Họ tên</th>
                <th className="px-5 py-2 font-medium">Chức vụ</th>
                <th className="px-5 py-2 font-medium">Email</th>
                <th className="px-5 py-2 font-medium">Trạng thái</th>
                <th className="px-5 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-2.5 text-neutral-900">{m.name}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{m.position || "—"}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{m.email || "—"}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={m.active ? "accent" : "neutral"}>{m.active ? "Đang công tác" : "Ngừng"}</Badge>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(m)}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(m)}>Xoá</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa nhân sự" : "Thêm nhân sự"}>
        <div className="space-y-4">
          <Field label="Họ tên" required>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Chức vụ">
            <TextInput value={form.position ?? ""} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Điện thoại">
            <TextInput value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Thứ tự hiển thị">
            <TextInput type="number" value={form.sortOrder ?? 0} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={form.active ?? true} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Đang công tác
          </label>

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá nhân sự "${toDelete?.name}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
