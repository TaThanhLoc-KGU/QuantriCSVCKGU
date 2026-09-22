import { useEffect, useState } from "react";
import { adminApi, ApiError, type CreateUserRequest, type UpdateUserRequest } from "../api";
import type { AdminUser, Member, Role } from "../types";
import { formatDate } from "../../lib/format";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

const ROLE_LABELS: Record<Role, string> = { ADMIN: "Quản trị viên", EDITOR: "Biên tập viên", STAFF: "Nhân viên" };

interface FormState {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: Role;
  memberId: number | null;
  active: boolean;
}

const emptyForm: FormState = { username: "", email: "", fullName: "", password: "", role: "STAFF", memberId: null, active: true };

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);

  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([adminApi.users.list(), adminApi.members.list()])
      .then(([u, m]) => {
        setUsers(u);
        setMembers(m);
      })
      .catch(() => setError("Không thể tải danh sách người dùng."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function memberName(id: number | null) {
    if (!id) return "—";
    return members.find((m) => m.id === id)?.name ?? "—";
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({ username: u.username, email: u.email, fullName: u.fullName, password: "", role: u.role, memberId: u.memberId, active: u.active });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const body: UpdateUserRequest = { email: form.email, fullName: form.fullName, role: form.role, memberId: form.memberId, active: form.active };
        await adminApi.users.update(editing.id, body);
      } else {
        const body: CreateUserRequest = {
          username: form.username,
          email: form.email,
          fullName: form.fullName,
          password: form.password,
          role: form.role,
          memberId: form.memberId,
          authProvider: "LOCAL",
        };
        await adminApi.users.create(body);
      }
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu người dùng thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.users.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá người dùng thất bại.");
      setToDelete(null);
    }
  }

  function openReset(u: AdminUser) {
    setResetTarget(u);
    setNewPassword("");
    setResetError(null);
    setResetDone(false);
  }

  async function handleReset() {
    if (!resetTarget) return;
    setResetting(true);
    setResetError(null);
    try {
      await adminApi.users.resetPassword(resetTarget.id, newPassword);
      setResetDone(true);
    } catch (err) {
      setResetError(err instanceof ApiError ? err.message : "Đặt lại mật khẩu thất bại.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Người dùng" description="Tài khoản đăng nhập trang quản trị." actions={<Button onClick={openCreate}>+ Thêm người dùng</Button>} />

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && users.length === 0 && <EmptyState title="Chưa có người dùng nào" />}

      {!loading && users.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Tên đăng nhập</th>
                <th className="px-5 py-2 font-medium">Họ tên</th>
                <th className="px-5 py-2 font-medium">Vai trò</th>
                <th className="px-5 py-2 font-medium">Nhân sự</th>
                <th className="px-5 py-2 font-medium">Đăng nhập gần nhất</th>
                <th className="px-5 py-2 font-medium">Trạng thái</th>
                <th className="px-5 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-2.5 font-mono text-xs text-neutral-700">{u.username}</td>
                  <td className="px-5 py-2.5 text-neutral-900">{u.fullName}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{ROLE_LABELS[u.role]}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{memberName(u.memberId)}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Chưa đăng nhập"}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={u.active ? "accent" : "neutral"}>{u.active ? "Hoạt động" : "Đã khoá"}</Badge>
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>Sửa</Button>
                      {u.authProvider !== "GOOGLE" && (
                        <Button size="sm" variant="secondary" onClick={() => openReset(u)}>Đặt lại MK</Button>
                      )}
                      <Button size="sm" variant="danger" onClick={() => setToDelete(u)}>Xoá</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa người dùng" : "Thêm người dùng"}>
        <div className="space-y-4">
          {!editing && (
            <Field label="Tên đăng nhập" required>
              <TextInput value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Field>
          )}
          <Field label="Họ tên" required>
            <TextInput value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </Field>
          <Field label="Email" required>
            <TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          {!editing && (
            <Field label="Mật khẩu" required hint="Tối thiểu 6 ký tự">
              <TextInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
          )}
          <Field label="Vai trò" required>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
              <option value="STAFF">Nhân viên</option>
              <option value="EDITOR">Biên tập viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </Select>
          </Field>
          <Field label="Liên kết nhân sự">
            <Select value={form.memberId ?? ""} onChange={(e) => setForm({ ...form, memberId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">— Không liên kết —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" className="h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Tài khoản đang hoạt động
            </label>
          )}

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !form.fullName.trim() || !form.email.trim() || (!editing && (!form.username.trim() || form.password.length < 6))}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <Drawer open={!!resetTarget} onClose={() => setResetTarget(null)} title={`Đặt lại mật khẩu — ${resetTarget?.fullName ?? ""}`}>
        <div className="space-y-4">
          <Field label="Mật khẩu mới" required hint="Tối thiểu 6 ký tự">
            <TextInput type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
          {resetError && <p className="text-sm text-urgent-600">{resetError}</p>}
          {resetDone && <p className="text-sm text-accent-700">Đã đặt lại mật khẩu thành công.</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setResetTarget(null)}>Đóng</Button>
            <Button onClick={handleReset} disabled={resetting || newPassword.length < 6}>
              {resetting ? "Đang lưu…" : "Đặt lại mật khẩu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá người dùng "${toDelete?.fullName}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
