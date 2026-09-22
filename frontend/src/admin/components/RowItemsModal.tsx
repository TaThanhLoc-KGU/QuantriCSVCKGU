import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { adminApi, ApiError } from "../api";
import type { PageTableRowView } from "../types";
import { Button } from "./ui";

interface Props {
  row: PageTableRowView;
  title: string;
  columns: { key: string; label: string }[];
  onClose: () => void;
  onChanged: () => void;
}

/** Quản lý danh sách chi tiết của 1 dòng (vd học phần của 1 ngành): nhập từ Excel (dòng đầu là tiêu đề cột), xem, xoá hết. */
export function RowItemsModal({ row, title, columns, onClose, onChanged }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ rowCount?: number; headers?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const name = String(Object.values(row.data).find((v) => typeof v === "string") ?? `Dòng ${row.id}`);

  function load() {
    adminApi.pages.rows.items(row.id).then(setItems).catch(() => setError("Không tải được danh sách."));
  }

  useEffect(load, [row.id]);

  async function run(commit: boolean) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await adminApi.pages.rows.importItems(row.id, file, commit);
      if (commit) {
        setMsg(`Đã nhập ${res.importedCount} dòng.`);
        setFile(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        load();
        onChanged();
      } else {
        setPreview(res);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Thao tác thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    try {
      await adminApi.pages.rows.clearItems(row.id);
      setItems([]);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá thất bại.");
    } finally {
      setBusy(false);
    }
  }

  // Cot chi tiet co the vua duoc tao tu file dau tien: suy ra tu khoa cua muc dau tien.
  const shownCols = columns.length > 0 ? columns : Object.keys(items[0] ?? {}).map((k) => ({ key: k, label: k }));

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col bg-white shadow-xl">
        <div className="border-b border-neutral-300 px-5 py-3">
          <h2 className="text-base font-extrabold text-neutral-900">
            {title}: {name}
          </h2>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div>
            <p className="mb-2 text-xs text-neutral-600">
              Chọn file Excel: dòng đầu là tiêu đề cột (vd STT, Mã, Tên học phần, Số tín chỉ). Nhập sẽ <strong>thay toàn bộ</strong> danh sách của dòng này. Các dòng khác dùng
              cùng bộ cột.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setPreview(null);
                }}
                className="text-sm file:mr-3 file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold"
              />
              <Button size="sm" variant="secondary" disabled={!file || busy} onClick={() => void run(false)}>
                Xem trước
              </Button>
              {preview && (preview.rowCount ?? 0) > 0 && (
                <Button size="sm" disabled={busy} onClick={() => void run(true)}>
                  Nhập {preview.rowCount} dòng
                </Button>
              )}
            </div>
            {preview && <p className="mt-2 text-sm text-neutral-700">{preview.rowCount} dòng · cột: {preview.headers?.join(", ")}</p>}
            {msg && <p className="mt-2 text-sm font-semibold text-accent-700">{msg}</p>}
            {error && <p className="mt-2 text-sm text-urgent-600">{error}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-sm font-bold text-neutral-900">Hiện có {items.length} dòng</p>
              {items.length > 0 && (
                <button onClick={() => void clear()} disabled={busy} className="text-xs font-semibold text-urgent-600 hover:underline">
                  Xoá hết
                </button>
              )}
            </div>
            {items.length > 0 && (
              <div className="max-h-64 overflow-auto border border-neutral-300">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-neutral-100 text-left text-xs">
                      {shownCols.map((c) => (
                        <th key={c.key} className="px-2 py-1.5">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, i) => (
                      <tr key={i} className="border-t border-neutral-100">
                        {shownCols.map((c) => (
                          <td key={c.key} className="px-2 py-1">
                            {String(it[c.key] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
