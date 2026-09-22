import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi, ApiError } from "../api";
import type { ToolView } from "../types";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, TextInput, Textarea } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

const KINDS = [
  {
    kind: "FORM" as const,
    title: "Biểu mẫu thu thập thông tin",
    desc: "Người dùng điền thông tin (họ tên, MSSV, đính kèm tệp…). Bạn xem hồ sơ, xử lý và trả kết quả; người gửi tra cứu tình trạng bằng mã hồ sơ. Ví dụ: khôi phục tài khoản, đăng ký cấp thẻ, đề nghị sửa chữa.",
  },
  {
    kind: "LOOKUP" as const,
    title: "Bảng tra cứu",
    desc: "Bạn nhập bảng dữ liệu từ Excel; người dùng gõ 1 mã (MSSV, số hồ sơ…) để xem thông tin tương ứng. Ví dụ: tra cứu email sinh viên, kết quả xét tuyển, lịch trực.",
  },
];

export function ToolsPage() {
  const navigate = useNavigate();
  const [tools, setTools] = useState<ToolView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", kind: "FORM" as "FORM" | "LOOKUP" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ToolView | null>(null);

  function load() {
    setLoading(true);
    adminApi.tools
      .list()
      .then(setTools)
      .catch(() => setError("Không thể tải danh sách chức năng."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function create() {
    setSaving(true);
    setFormError(null);
    try {
      const t = await adminApi.tools.create({ name: form.name, description: form.description, kind: form.kind });
      navigate(`/admin/cong-cu/${t.id}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Tạo chức năng thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(t: ToolView) {
    try {
      await adminApi.tools.update(t.id, { active: !t.active });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cập nhật thất bại.");
    }
  }

  async function remove() {
    if (!toDelete) return;
    try {
      await adminApi.tools.remove(toDelete.id);
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
        title="Chức năng tự tạo"
        description="Tự dựng thêm chức năng cho website của đơn vị mà không cần lập trình: biểu mẫu thu thập thông tin và bảng tra cứu."
        actions={
          <Button
            onClick={() => {
              setForm({ name: "", description: "", kind: "FORM" });
              setFormError(null);
              setDrawer(true);
            }}
          >
            + Tạo chức năng
          </Button>
        }
      />
      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && tools.length === 0 && (
        <EmptyState title="Chưa có chức năng nào" description="Bấm “Tạo chức năng” để dựng biểu mẫu hoặc bảng tra cứu đầu tiên." />
      )}

      {tools.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase">
                <th className="px-4 py-2">Chức năng</th>
                <th className="px-4 py-2">Loại</th>
                <th className="px-4 py-2">Dữ liệu</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="font-bold text-neutral-900">{t.name}</p>
                    <a href={`/cong-cu/${t.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-700 hover:underline">
                      /cong-cu/{t.slug}
                    </a>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={t.kind === "FORM" ? "brand" : "accent"}>{t.kind === "FORM" ? "Biểu mẫu" : "Tra cứu"}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-700">
                    {t.kind === "FORM" ? (t.pending > 0 ? <span className="font-bold text-urgent-600">{t.pending} hồ sơ mới</span> : "Không có hồ sơ mới") : `${t.rowCount} dòng dữ liệu`}
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => void toggle(t)} className="text-xs font-semibold text-brand-700 hover:underline">
                      {t.active ? "Đang hiển thị — tạm dừng" : "Đang tạm dừng — bật lại"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <Link to={`/admin/cong-cu/${t.id}`}>
                        <Button size="sm" variant="secondary">
                          Thiết kế & dữ liệu
                        </Button>
                      </Link>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(t)}>
                        Xoá
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Tạo chức năng mới">
        <div className="space-y-4">
          <div className="space-y-2">
            {KINDS.map((k) => (
              <label key={k.kind} className={`block cursor-pointer border p-3 ${form.kind === k.kind ? "border-brand-700 bg-brand-50" : "border-neutral-300"}`}>
                <span className="flex items-center gap-2 text-sm font-bold text-neutral-900">
                  <input type="radio" name="kind" checked={form.kind === k.kind} onChange={() => setForm({ ...form, kind: k.kind })} />
                  {k.title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-neutral-600">{k.desc}</span>
              </label>
            ))}
          </div>
          <Field label="Tên chức năng" required hint="Hiện ở tiêu đề trang và trong menu Dịch vụ.">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Mô tả ngắn">
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          {formError && <p className="text-sm text-urgent-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawer(false)}>
              Huỷ
            </Button>
            <Button onClick={create} disabled={saving || !form.name.trim()}>
              {saving ? "Đang tạo…" : "Tạo và thiết kế"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá chức năng "${toDelete?.name}"?`}
        description="Toàn bộ hồ sơ/dữ liệu của chức năng này sẽ bị xoá và không khôi phục được."
        confirmLabel="Xoá"
        danger
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
