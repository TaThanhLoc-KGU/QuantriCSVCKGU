import { useEffect, useState } from "react";
import { adminApi, ApiError, type CongVanNoiBoSaveRequest } from "../api";
import type { CongVanIncomingDocument, CongVanInternalDocument, CongVanOutgoingDocument } from "../types";
import { formatDate } from "../../lib/format";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, Textarea, TextInput } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const PAGE_SIZE = 20;

type Tab = "incoming" | "outgoing" | "noibo";

export function CongVanPage() {
  const [tab, setTab] = useState<Tab>("incoming");

  return (
    <div>
      <PageHeader
        title="Đối chiếu Công văn"
        description="Đối chiếu văn bản với hệ thống Công văn (congvan.vnkgu.edu.vn) qua API — dùng để ghi nhận thành nhiệm vụ theo dõi, hoặc quản lý văn bản nội bộ của phòng."
      />

      <div className="mb-4 flex gap-1 border-b border-neutral-200">
        <TabButton label="Văn bản đến (giao/phối hợp)" active={tab === "incoming"} onClick={() => setTab("incoming")} />
        <TabButton label="Văn bản đi (công khai)" active={tab === "outgoing"} onClick={() => setTab("outgoing")} />
        <TabButton label="Văn bản nội bộ" active={tab === "noibo"} onClick={() => setTab("noibo")} />
      </div>

      {tab === "incoming" && <IncomingTab />}
      {tab === "outgoing" && <OutgoingTab />}
      {tab === "noibo" && <NoiBoTab />}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
        active ? "border-brand-600 text-brand-700" : "border-transparent text-neutral-500 hover:text-neutral-800"
      }`}
    >
      {label}
    </button>
  );
}

function IncomingTab() {
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CongVanIncomingDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    setError(null);
    adminApi.congVan
      .incoming({ year, q: search.trim() || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setRows(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể kết nối API văn bản đến."))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [year, page]);

  function handleSearchSubmit() {
    setPage(1);
    load();
  }

  async function handleCreateTask(doc: CongVanIncomingDocument) {
    setCreating(doc.id);
    setError(null);
    try {
      await adminApi.congVan.createTask(doc.id);
      setCreated((prev) => new Set(prev).add(doc.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tạo nhiệm vụ thất bại.");
    } finally {
      setCreating(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={year}
          onChange={(e) => {
            setPage(1);
            setYear(Number(e.target.value));
          }}
          className="max-w-28"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder="Tìm theo trích yếu, số văn bản, cơ quan ban hành…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          className="max-w-sm"
        />
        <Button size="sm" variant="secondary" onClick={handleSearchSubmit}>
          Tìm
        </Button>
        <span className="ml-auto text-xs text-neutral-500">{total} văn bản đến trong năm {year}</span>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="Không có văn bản nào phù hợp"
          description="Không tìm thấy văn bản đến nào được giao/phối hợp cho phòng trong năm này, hoặc không khớp từ khóa tìm kiếm."
        />
      )}

      {!loading && rows.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Số văn bản</th>
                <th className="px-4 py-2 font-medium">Trích yếu</th>
                <th className="px-4 py-2 font-medium">Cơ quan ban hành</th>
                <th className="px-4 py-2 font-medium">Người ký</th>
                <th className="px-4 py-2 font-medium">Ngày đến</th>
                <th className="px-4 py-2 font-medium">Trạng thái</th>
                <th className="px-4 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((doc) => {
                const isCreated = created.has(doc.id);
                const soHieu = doc.soDen || doc.soVanBan || "—";
                return (
                  <tr key={doc.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                      {soHieu}
                      {doc.coFile && <span className="ml-1" title="Có tệp đính kèm">📎</span>}
                    </td>
                    <td className="px-4 py-2.5 max-w-md text-neutral-900">{doc.trichYeu}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.coQuanBanHanh ?? "—"}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.nguoiKy ?? "—"}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.ngayDen ? formatDate(doc.ngayDen) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <Badge tone={doc.trangThai === "hoan_thanh" ? "brand" : doc.trangThai === "qua_han" ? "urgent" : "neutral"}>
                        {doc.trangThaiText}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Button
                        size="sm"
                        variant={isCreated ? "secondary" : "primary"}
                        disabled={isCreated || creating === doc.id}
                        onClick={() => handleCreateTask(doc)}
                      >
                        {isCreated ? "Đã ghi nhận" : creating === doc.id ? "Đang tạo…" : "Ghi nhận thành nhiệm vụ"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
              <span>
                Trang {page}/{totalPages}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ← Trước
                </Button>
                <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Sau →
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function OutgoingTab() {
  const [nam, setNam] = useState<number>(CURRENT_YEAR);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<CongVanOutgoingDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    setError(null);
    adminApi.congVan
      .outgoing({ nam, q: search.trim() || undefined, page, pageSize: PAGE_SIZE })
      .then((res) => {
        setRows(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể kết nối API văn bản đi công khai."))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [nam, page]);

  function handleSearchSubmit() {
    setPage(1);
    load();
  }

  async function handleCreateTask(doc: CongVanOutgoingDocument) {
    setCreating(doc.id);
    setError(null);
    try {
      await adminApi.congVan.outgoingCreateTask(doc.id);
      setCreated((prev) => new Set(prev).add(doc.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tạo nhiệm vụ thất bại.");
    } finally {
      setCreating(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          value={nam}
          onChange={(e) => {
            setPage(1);
            setNam(Number(e.target.value));
          }}
          className="max-w-28"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder="Tìm theo trích yếu, số văn bản…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
          className="max-w-sm"
        />
        <Button size="sm" variant="secondary" onClick={handleSearchSubmit}>
          Tìm
        </Button>
        <span className="ml-auto text-xs text-neutral-500">{total} văn bản đi đã công khai trong năm {nam}</span>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState
          title="Không có văn bản nào phù hợp"
          description="Chưa có văn bản đi nào được văn thư gắn dấu công khai trong năm này, hoặc không khớp từ khóa tìm kiếm."
        />
      )}

      {!loading && rows.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Số văn bản</th>
                <th className="px-4 py-2 font-medium">Trích yếu</th>
                <th className="px-4 py-2 font-medium">Loại</th>
                <th className="px-4 py-2 font-medium">Người ký</th>
                <th className="px-4 py-2 font-medium">Ngày ban hành</th>
                <th className="px-4 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((doc) => {
                const isCreated = created.has(doc.id);
                return (
                  <tr key={doc.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                      {doc.coFile ? (
                        <a
                          href={adminApi.congVan.outgoingFileUrl(doc.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline"
                          title="Xem tệp"
                        >
                          {doc.soVanBan} 📎
                        </a>
                      ) : (
                        doc.soVanBan
                      )}
                      {doc.daKySo && (
                        <span className="ml-1" title="Đã ký số">
                          ✅
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 max-w-md text-neutral-900">{doc.trichYeu}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.loaiVanBan ?? "—"}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.nguoiKy ?? "—"}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.ngayBanHanh ? formatDate(doc.ngayBanHanh) : "—"}</td>
                    <td className="px-4 py-2.5">
                      <Button
                        size="sm"
                        variant={isCreated ? "secondary" : "primary"}
                        disabled={isCreated || creating === doc.id}
                        onClick={() => handleCreateTask(doc)}
                      >
                        {isCreated ? "Đã ghi nhận" : creating === doc.id ? "Đang tạo…" : "Ghi nhận thành nhiệm vụ"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
              <span>
                Trang {page}/{totalPages}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ← Trước
                </Button>
                <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Sau →
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

function emptyNoiBoForm(): CongVanNoiBoSaveRequest {
  return { soHieu: "", tieuDe: "", noiDung: "", ngayBanHanh: new Date().toISOString().slice(0, 10), nguoiKy: "", trangThai: 1 };
}

const NOIBO_STATUS_LABELS: Record<number, string> = { 0: "Dự thảo", 1: "Đã ban hành", 2: "Thu hồi" };

function NoiBoTab() {
  const [rows, setRows] = useState<CongVanInternalDocument[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CongVanNoiBoSaveRequest>(emptyNoiBoForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<CongVanInternalDocument | null>(null);

  const [files, setFiles] = useState<{ id: number; tenFile: string; ngayUpload: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    adminApi.congVan.noibo
      .list({ tuKhoa: search.trim() || undefined })
      .then(setRows)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể kết nối API văn bản nội bộ."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyNoiBoForm());
    setFiles([]);
    setFormError(null);
    setDrawerOpen(true);
  }

  async function openEdit(doc: CongVanInternalDocument) {
    setEditingId(doc.id);
    setForm({
      soHieu: doc.soHieu ?? "",
      tieuDe: doc.tieuDe,
      noiDung: doc.noiDung ?? "",
      ngayBanHanh: doc.ngayBanHanh.slice(0, 10),
      nguoiKy: doc.nguoiKy ?? "",
      trangThai: doc.trangThai,
    });
    setFormError(null);
    setDrawerOpen(true);
    setFiles([]);
    try {
      const detail = await adminApi.congVan.noibo.get(doc.id);
      setFiles(detail.files);
    } catch {
      // bo qua - danh sach file khong tai duoc thi van sua duoc van ban binh thuong
    }
  }

  async function handleSave() {
    if (!form.tieuDe.trim() || !form.ngayBanHanh) return;
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) await adminApi.congVan.noibo.update(editingId, form);
      else await adminApi.congVan.noibo.create(form);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu văn bản thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.congVan.noibo.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá văn bản thất bại.");
      setToDelete(null);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;
    setUploading(true);
    try {
      const ref = await adminApi.congVan.noibo.uploadFile(editingId, file);
      setFiles((prev) => [...prev, ref]);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Tải tệp thất bại.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveFile(fileId: number) {
    if (!editingId) return;
    try {
      await adminApi.congVan.noibo.removeFile(editingId, fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Xoá tệp thất bại.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TextInput
          placeholder="Tìm theo số hiệu, tiêu đề…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="max-w-sm"
        />
        <Button size="sm" variant="secondary" onClick={load}>
          Tìm
        </Button>
        <Button size="sm" className="ml-auto" onClick={openCreate}>
          + Thêm văn bản nội bộ
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && rows.length === 0 && (
        <EmptyState title="Chưa có văn bản nội bộ nào" description="Bấm “+ Thêm văn bản nội bộ” để tạo văn bản đầu tiên." />
      )}

      {!loading && rows.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Số hiệu</th>
                <th className="px-4 py-2 font-medium">Tiêu đề</th>
                <th className="px-4 py-2 font-medium">Người ký</th>
                <th className="px-4 py-2 font-medium">Ngày ban hành</th>
                <th className="px-4 py-2 font-medium">Trạng thái</th>
                <th className="px-4 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((doc) => (
                <tr key={doc.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                    {doc.soHieu || "—"}
                    {!!doc.soFile && <span className="ml-1" title={`${doc.soFile} tệp đính kèm`}>📎</span>}
                  </td>
                  <td className="px-4 py-2.5 max-w-md text-neutral-900">{doc.tieuDe}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{doc.nguoiKy ?? "—"}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{formatDate(doc.ngayBanHanh)}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={doc.trangThai === 1 ? "brand" : doc.trangThai === 2 ? "urgent" : "neutral"}>{doc.trangThaiText}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(doc)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setToDelete(doc)}>
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

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editingId ? "Sửa văn bản nội bộ" : "Thêm văn bản nội bộ"}>
        <div className="space-y-4">
          <Field label="Số hiệu" hint="Ví dụ: 02/TB-P.QTCSVC">
            <TextInput value={form.soHieu ?? ""} onChange={(e) => setForm({ ...form, soHieu: e.target.value })} />
          </Field>
          <Field label="Tiêu đề" required>
            <Textarea rows={2} value={form.tieuDe} onChange={(e) => setForm({ ...form, tieuDe: e.target.value })} />
          </Field>
          <Field label="Nội dung">
            <Textarea rows={4} value={form.noiDung ?? ""} onChange={(e) => setForm({ ...form, noiDung: e.target.value })} />
          </Field>
          <Field label="Ngày ban hành" required>
            <TextInput type="date" value={form.ngayBanHanh} onChange={(e) => setForm({ ...form, ngayBanHanh: e.target.value })} />
          </Field>
          <Field label="Người ký">
            <TextInput value={form.nguoiKy ?? ""} onChange={(e) => setForm({ ...form, nguoiKy: e.target.value })} />
          </Field>
          <Field label="Trạng thái">
            <Select value={form.trangThai ?? 1} onChange={(e) => setForm({ ...form, trangThai: Number(e.target.value) })}>
              {Object.entries(NOIBO_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          {editingId && (
            <Field label="Tệp đính kèm">
              <div className="space-y-1.5">
                {files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-1.5 text-sm">
                    <a
                      href={adminApi.congVan.noibo.fileUrl(editingId, f.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-brand-600 hover:underline"
                    >
                      📎 {f.tenFile}
                    </a>
                    <button onClick={() => handleRemoveFile(f.id)} className="ml-2 shrink-0 text-xs text-urgent-600 hover:underline">
                      Xoá
                    </button>
                  </div>
                ))}
                <label className="block cursor-pointer rounded-md border border-dashed border-neutral-300 px-3 py-2 text-center text-xs text-neutral-500 hover:border-brand-400 hover:bg-brand-50/50">
                  {uploading ? "Đang tải lên…" : "+ Chọn tệp để đính kèm"}
                  <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              </div>
            </Field>
          )}
          {!editingId && (
            <p className="text-xs text-neutral-400">Lưu văn bản trước, sau đó mở lại để đính kèm tệp.</p>
          )}

          {formError && <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{formError}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.tieuDe.trim() || !form.ngayBanHanh}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá văn bản "${toDelete?.tieuDe}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
