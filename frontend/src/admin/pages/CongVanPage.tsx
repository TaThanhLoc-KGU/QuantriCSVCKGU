import { useEffect, useMemo, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { CongVanIncomingDocument } from "../types";
import { formatDate } from "../../lib/format";
import { Badge, Button, Card, EmptyState, ErrorBanner, LoadingState, PageHeader, Select, TextInput } from "../components/ui";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export function CongVanPage() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [rows, setRows] = useState<CongVanIncomingDocument[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());

  function load() {
    setLoading(true);
    setError(null);
    adminApi.congVan
      .incoming(year)
      .then(setRows)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Không thể kết nối hệ thống Công văn."),
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [year]);

  const visibleRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(
      (r) =>
        r.trichYeu.toLowerCase().includes(q) ||
        (r.soCV ?? "").toLowerCase().includes(q) ||
        (r.tenCoQuan ?? "").toLowerCase().includes(q) ||
        (r.nguoiKy ?? "").toLowerCase().includes(q),
    );
  }, [rows, search]);

  async function handleCreateTask(doc: CongVanIncomingDocument) {
    setCreating(doc.mscv);
    setError(null);
    try {
      await adminApi.congVan.createTask(doc.mscv, year);
      setCreated((prev) => new Set(prev).add(doc.mscv));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tạo nhiệm vụ thất bại.");
    } finally {
      setCreating(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Đối chiếu Công văn"
        description="Văn bản đến được giao/phối hợp cho phòng trên hệ thống Công văn (congvan.vnkgu.edu.vn) — chỉ đọc, dùng để ghi nhận thành nhiệm vụ theo dõi."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="max-w-28">
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder="Tìm theo trích yếu, số CV, cơ quan, người ký…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <span className="ml-auto text-xs text-neutral-500">{rows.length} văn bản trong năm {year}</span>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && !error && visibleRows.length === 0 && (
        <EmptyState
          title="Không có văn bản nào phù hợp"
          description="Không tìm thấy văn bản đến nào được giao/phối hợp cho phòng trong năm này."
        />
      )}

      {!loading && visibleRows.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Số CV</th>
                <th className="px-4 py-2 font-medium">Trích yếu</th>
                <th className="px-4 py-2 font-medium">Cơ quan ban hành</th>
                <th className="px-4 py-2 font-medium">Người ký</th>
                <th className="px-4 py-2 font-medium">Ngày đến</th>
                <th className="px-4 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((doc) => {
                const isCreated = created.has(doc.mscv);
                const isDone = !!doc.ngayHoanThanh;
                return (
                  <tr key={doc.mscv} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                      {doc.soCV || "—"}
                      {doc.coFile && <span className="ml-1" title="Có tệp đính kèm">📎</span>}
                    </td>
                    <td className="px-4 py-2.5 max-w-md text-neutral-900">
                      {doc.trichYeu}
                      {isDone && <Badge tone="brand">Đã hoàn thành (CV)</Badge>}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.tenCoQuan ?? "—"}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{doc.nguoiKy ?? "—"}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{formatDate(doc.ngayDen)}</td>
                    <td className="px-4 py-2.5">
                      <Button
                        size="sm"
                        variant={isCreated ? "secondary" : "primary"}
                        disabled={isCreated || creating === doc.mscv}
                        onClick={() => handleCreateTask(doc)}
                      >
                        {isCreated ? "Đã ghi nhận" : creating === doc.mscv ? "Đang tạo…" : "Ghi nhận thành nhiệm vụ"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
