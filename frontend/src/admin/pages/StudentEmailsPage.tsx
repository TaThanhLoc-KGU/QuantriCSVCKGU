import { useEffect, useRef, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { StudentEmailImportPreview, StudentEmailRecordView } from "../types";
import { Badge, Button, Card, EmptyState, ErrorBanner, LoadingState, PageHeader, TextInput } from "../components/ui";

export function StudentEmailsPage() {
  const [total, setTotal] = useState<number | null>(null);
  const [items, setItems] = useState<StudentEmailRecordView[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<StudentEmailImportPreview | null>(null);
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedMessage, setImportedMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function load(q = search) {
    setLoading(true);
    setError(null);
    adminApi.studentEmails
      .list(q)
      .then((res) => {
        setTotal(res.total);
        setItems(res.items);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải danh sách."))
      .finally(() => setLoading(false));
  }

  useEffect(() => load(""), []);

  function handleFileChange(f: File | null) {
    setFile(f);
    setPreview(null);
    setImportError(null);
    setImportedMessage(null);
  }

  async function handlePreview() {
    if (!file) return;
    setBusy("preview");
    setImportError(null);
    setImportedMessage(null);
    try {
      const result = await adminApi.studentEmails.previewImport(file);
      setPreview(result);
    } catch (err) {
      setImportError(err instanceof ApiError ? err.message : "Đọc file thất bại.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCommit() {
    if (!file) return;
    setBusy("commit");
    setImportError(null);
    try {
      const result = await adminApi.studentEmails.commitImport(file);
      setImportedMessage(`Đã thêm ${result.addedCount} sinh viên mới, cập nhật ${result.updatedCount} sinh viên đã có.`);
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      load("");
    } catch (err) {
      setImportError(err instanceof ApiError ? err.message : "Nhập dữ liệu thất bại.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Danh bạ email sinh viên"
        description="Danh sách MSSV → email trường cấp, dùng cho trang tra cứu công khai /tra-cuu-email."
      />

      <Card className="mb-6 p-5">
        <h2 className="mb-1 text-sm font-semibold text-neutral-900">Nhập từ Excel</h2>
        <p className="mb-3 text-xs text-neutral-500">
          Chọn file danh sách (cột: Mã sinh viên, Họ và tên, Mã lớp, Ngành, Mã ngành, Khóa, Email). Nhập sẽ{" "}
          <strong>thêm vào</strong> danh sách hiện có: MSSV chưa có thì thêm mới, MSSV đã có thì cập nhật theo file — không xóa ai.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            className="text-sm text-neutral-600 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-neutral-700 hover:file:bg-neutral-50"
          />
          <Button size="sm" variant="secondary" onClick={handlePreview} disabled={!file || busy !== null}>
            {busy === "preview" ? "Đang đọc…" : "Xem trước"}
          </Button>
          {preview && preview.validCount > 0 && preview.errors.length === 0 && (
            <Button size="sm" onClick={handleCommit} disabled={busy !== null}>
              {busy === "commit" ? "Đang nhập…" : `Xác nhận nhập ${preview.validCount} dòng`}
            </Button>
          )}
        </div>

        {preview && (
          <div className="mt-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm">
            <p className="text-neutral-700">
              {preview.validCount} dòng hợp lệ: {preview.newCount} thêm mới, {preview.updateCount} cập nhật.
            </p>
            {preview.errors.length > 0 && (
              <div className="mt-1.5">
                <p className="text-urgent-600">Có lỗi ở một số dòng — sửa file rồi xem trước lại:</p>
                <ul className="mt-1 list-inside list-disc text-xs text-urgent-600">
                  {preview.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {importError && <p className="mt-2 text-sm text-urgent-600">{importError}</p>}
        {importedMessage && <p className="mt-2 text-sm text-accent-700">{importedMessage}</p>}
      </Card>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <TextInput
          placeholder="Tìm theo MSSV, họ tên, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="max-w-sm"
        />
        <Button size="sm" variant="secondary" onClick={() => load()}>
          Tìm
        </Button>
        {total !== null && <Badge tone="brand">{total} sinh viên</Badge>}
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && items.length === 0 && (
        <EmptyState title="Chưa có dữ liệu" description="Nhập danh sách từ Excel ở trên để bắt đầu." />
      )}

      {!loading && items.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">MSSV</th>
                <th className="px-4 py-2 font-medium">Họ và tên</th>
                <th className="px-4 py-2 font-medium">Lớp</th>
                <th className="px-4 py-2 font-medium">Ngành</th>
                <th className="px-4 py-2 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">{r.studentId}</td>
                  <td className="px-4 py-2.5 text-neutral-900">{r.fullName}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{r.className ?? "—"}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{r.major ?? "—"}</td>
                  <td className="px-4 py-2.5 text-neutral-500">{r.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length >= 50 && (
            <p className="border-t border-neutral-200 px-4 py-2 text-xs text-neutral-400">
              Chỉ hiển thị 50 kết quả đầu — thu hẹp bằng tìm kiếm để xem thêm.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
