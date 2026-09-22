import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ApiError } from "../api";
import { Button, Checkbox, Select } from "./ui";

interface Preview {
  headers: string[];
  rowCount: number;
  groups: { name: string; count: number; matched: boolean }[];
}

interface Props {
  blockId: number;
  title: string;
  onClose: () => void;
  onDone: () => void;
}

async function send(blockId: number, file: File, keyIndex: number, createMissing: boolean, commit: boolean) {
  const cookie = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
  if (!cookie) await fetch("/api/auth/csrf", { credentials: "include" });
  const token = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)?.[1];
  const fd = new FormData();
  fd.append("file", file);
  const headers = new Headers();
  if (token) headers.set("X-XSRF-TOKEN", decodeURIComponent(token));
  const res = await fetch(
    `/api/admin/pages/blocks/${blockId}/items/import?preview=${commit ? "false" : "true"}&keyIndex=${keyIndex}&createMissing=${createMissing}`,
    { method: "POST", body: fd, headers, credentials: "include" },
  );
  if (!res.ok) throw new ApiError(res.status, `Thao tác thất bại (${res.status})`);
  return res.json();
}

/** Nhập một lần cho cả bảng: 1 file Excel chung, chọn cột nào cho biết dòng (vd Ngành); các cột còn lại là chi tiết (vd học phần). */
export function BulkItemsModal({ blockId, title, onClose, onDone }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [keyIndex, setKeyIndex] = useState(0);
  const [createMissing, setCreateMissing] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function run(commit: boolean, idx = keyIndex) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const res = await send(blockId, file, idx, createMissing, commit);
      if (commit) {
        setResult(`Đã nhập ${res.items} dòng chi tiết cho ${res.programs} mục${res.createdRows ? ` (tạo mới ${res.createdRows} dòng)` : ""}.`);
        setPreview(null);
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
        onDone();
      } else {
        const p = res as Preview;
        setPreview(p);
        if (!preview) {
          // Doan cot xac dinh dong: tieu de co "nganh"/"chuong trinh", neu khong thi cot dau.
          const guess = p.headers.findIndex((h) => /ngành|nganh|chương trình|chuong trinh/i.test(h));
          const next = guess >= 0 ? guess : 0;
          setKeyIndex(next);
          if (next !== idx) await run(false, next);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Thao tác thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const matched = preview?.groups.filter((g) => g.matched).length ?? 0;
  const unmatched = (preview?.groups.length ?? 0) - matched;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col bg-white shadow-xl">
        <div className="border-b border-neutral-300 px-5 py-3">
          <h2 className="text-base font-extrabold text-neutral-900">Nhập một lần: {title}</h2>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <p className="text-xs leading-relaxed text-neutral-600">
            Dùng 1 file Excel chung, dòng đầu là tiêu đề cột. Chọn cột cho biết dòng nào (vd <strong>Ngành</strong>); các cột còn lại (Mã, Tên học phần, Số tín chỉ…) là danh sách chi tiết. Hệ thống tự ghép theo tên
            (không phân biệt hoa/thường, dấu). Chỉ những dòng có trong file mới bị thay danh sách chi tiết.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPreview(null);
                setResult(null);
              }}
              className="text-sm file:mr-3 file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold"
            />
            <Button size="sm" variant="secondary" disabled={!file || busy} onClick={() => void run(false)}>
              Xem trước
            </Button>
          </div>

          {preview && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm font-semibold text-neutral-800">Cột xác định dòng</label>
                <Select
                  value={keyIndex}
                  onChange={(e) => {
                    const i = Number(e.target.value);
                    setKeyIndex(i);
                    void run(false, i);
                  }}
                  className="max-w-xs"
                >
                  {preview.headers.map((h, i) => (
                    <option key={i} value={i}>
                      {h}
                    </option>
                  ))}
                </Select>
              </div>
              <Checkbox label="Tạo dòng mới cho tên chưa có trong bảng" checked={createMissing} onChange={(e) => setCreateMissing(e.target.checked)} />
              <p className="text-sm text-neutral-800">
                {preview.rowCount} dòng chi tiết · {preview.groups.length} mục ({matched} khớp dòng có sẵn, {unmatched} chưa có)
              </p>
              <div className="max-h-56 overflow-auto border border-neutral-300">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-100 text-left text-xs">
                      <th className="px-2 py-1.5">Mục</th>
                      <th className="px-2 py-1.5">Số dòng</th>
                      <th className="px-2 py-1.5">Ghép</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.groups.map((g) => (
                      <tr key={g.name} className="border-t border-neutral-100">
                        <td className="px-2 py-1">{g.name}</td>
                        <td className="px-2 py-1">{g.count}</td>
                        <td className="px-2 py-1">
                          {g.matched ? <span className="font-semibold text-accent-700">Khớp</span> : <span className="text-neutral-500">{createMissing ? "Tạo mới" : "Bỏ qua"}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button disabled={busy} onClick={() => void run(true)}>
                Nhập {preview.rowCount} dòng cho {preview.groups.length} mục
              </Button>
            </div>
          )}
          {result && <p className="text-sm font-semibold text-accent-700">{result}</p>}
          {error && <p className="text-sm text-urgent-600">{error}</p>}
        </div>
        <div className="flex justify-end border-t border-neutral-300 px-5 py-3">
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
