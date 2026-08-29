import { useEffect, useMemo, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { CongVanIncomingDocument, CongVanOutgoingDocument } from "../types";
import { formatDate } from "../../lib/format";
import { Badge, Button, Card, EmptyState, ErrorBanner, LoadingState, PageHeader, Select, TextInput } from "../components/ui";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

type Tab = "incoming" | "outgoing";

export function CongVanPage() {
  const [tab, setTab] = useState<Tab>("incoming");

  return (
    <div>
      <PageHeader
        title="Đối chiếu Công văn"
        description="Đối chiếu văn bản với hệ thống Công văn (congvan.vnkgu.edu.vn) — chỉ đọc, dùng để ghi nhận thành nhiệm vụ theo dõi."
      />

      <div className="mb-4 flex gap-1 border-b border-neutral-200">
        <TabButton label="Văn bản đến (giao/phối hợp)" active={tab === "incoming"} onClick={() => setTab("incoming")} />
        <TabButton label="Văn bản đi (công khai)" active={tab === "outgoing"} onClick={() => setTab("outgoing")} />
      </div>

      {tab === "incoming" ? <IncomingTab /> : <OutgoingTab />}
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

const PAGE_SIZE = 20;

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
