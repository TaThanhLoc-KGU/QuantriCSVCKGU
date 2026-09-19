import { useEffect, useMemo, useRef, useState } from "react";
import type { DataTableColumn, DataTableGroup, ResolvedPageBlock } from "../lib/types";
import { formatDate } from "../lib/format";

const PAGE_SIZE = 10;

function firstText(data: Record<string, unknown>): string {
  return String(Object.values(data).find((v) => typeof v === "string") ?? "");
}

function cellText(column: DataTableColumn, value: unknown): string {
  if (value == null) return "";
  if (column.type === "DATE") return formatDate(value as string);
  if (column.type === "TEXT") return String(value);
  if (column.type === "LINK") return ((value as { label?: string }).label ?? "") + " " + ((value as { url?: string }).url ?? "");
  if (column.type === "FILE") return (value as { name?: string }).name ?? "";
  return "";
}

function Cell({ column, value }: { column: DataTableColumn; value: unknown }) {
  if (value == null || value === "") return <span className="text-neutral-300">—</span>;

  if (column.type === "DATE") return <span>{formatDate(value as string)}</span>;
  if (column.type === "TEXT") return <span>{String(value)}</span>;

  if (column.type === "LINK") {
    const link = value as { url?: string; label?: string };
    if (!link.url) return <span className="text-neutral-300">—</span>;
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-700"
      >
        {link.label || "Xem"}
      </a>
    );
  }

  // FILE
  const file = value as { url?: string; name?: string };
  if (!file.url) return <span className="text-neutral-300">—</span>;
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      title={file.name ?? "Tải về"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
      aria-label={`Tải về ${file.name ?? ""}`}
    >
      <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 16h12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

interface DetailConfig {
  enabled?: boolean;
  buttonLabel?: string;
  title?: string;
  columns?: { key: string; label: string }[];
}

function DetailTable({ title, columns, items, onClose }: { title: string; columns: { key: string; label: string }[]; items: Record<string, unknown>[]; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((it) => columns.some((c) => String(it[c.key] ?? "").toLowerCase().includes(needle)));
  }, [items, columns, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const rows = filtered.slice(page * size, page * size + size);

  return (
    <div ref={ref} className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b-2 border-brand-700 px-4">
        <h3 className="py-3 text-base font-extrabold text-brand-800">{title}</h3>
        <button onClick={onClose} className="text-xs font-semibold text-brand-700 hover:underline">
          Đóng
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 text-sm">
        <label className="flex items-center gap-2 text-neutral-600">
          Hiển thị
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="rounded-md border border-neutral-300 px-2 py-1"
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          dòng
        </label>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Tìm kiếm…"
          className="w-full max-w-xs rounded-md border border-neutral-300 px-3 py-1.5 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2 font-medium">STT</th>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-neutral-400">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              rows.map((it, i) => (
                <tr key={i} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2 text-neutral-400">{page * size + i + 1}</td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2">
                      {String(it[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
        <span>
          {filtered.length === 0 ? "0" : page * size + 1}–{Math.min(filtered.length, page * size + size)} / {filtered.length} dòng
        </span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-md border border-neutral-300 px-2.5 py-1 disabled:opacity-40">
            ← Trước
          </button>
          <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded-md border border-neutral-300 px-2.5 py-1 disabled:opacity-40">
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
}

export function DataTableBlockView({ block }: { block: ResolvedPageBlock }) {
  const detail = block.config.detail as DetailConfig | undefined;
  const [openRowId, setOpenRowId] = useState<number | null>(null);
  const columns = (block.config.columns as DataTableColumn[] | undefined) ?? [];
  const groups = (block.config.groups as DataTableGroup[] | undefined) ?? [];
  const groupLabel = block.config.groupLabel as string | null | undefined;

  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0]?.key ?? "");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let rows = block.rows;
    if (groupLabel) {
      rows = rows.filter((r) => r.groupKey === selectedGroup);
    }
    if (search.trim()) {
      const needle = search.trim().toLowerCase();
      rows = rows.filter((r) => columns.some((c) => cellText(c, r.data[c.key]).toLowerCase().includes(needle)));
    }
    return rows;
  }, [block.rows, groupLabel, selectedGroup, search, columns]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (columns.length === 0) return null;
  const openRow = openRowId != null ? block.rows.find((r) => r.id === openRowId) : undefined;

  return (
    <div>
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {groupLabel && (
        <div className="flex flex-wrap items-end gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-neutral-700">{groupLabel}</span>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setPage(0);
              }}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">— Chọn {groupLabel.toLowerCase()} —</option>
              {groups.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3">
        <p className="text-xs text-neutral-400">{filtered.length} kết quả</p>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Tìm kiếm…"
          className="w-full max-w-xs rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-3 py-2 font-medium">STT</th>
              {columns.map((c) => (
                <th key={c.key} className="px-3 py-2 font-medium">
                  {c.label}
                </th>
              ))}
              {detail?.enabled && <th className="px-3 py-2 font-medium">Chi tiết</th>}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1 + (detail?.enabled ? 1 : 0)} className="px-3 py-8 text-center text-neutral-400">
                  {groupLabel && !selectedGroup ? `Vui lòng chọn ${groupLabel.toLowerCase()} để xem dữ liệu.` : "Không có dữ liệu."}
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr key={row.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2.5 text-neutral-400">{page * PAGE_SIZE + i + 1}</td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2.5">
                      <Cell column={c} value={row.data[c.key]} />
                    </td>
                  ))}
                  {detail?.enabled && (
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => setOpenRowId(row.id)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-colors ${openRowId === row.id ? "bg-brand-800" : "bg-brand-600 hover:bg-brand-700"}`}
                      >
                        {detail.buttonLabel || "Xem chi tiết"}
                        {row.itemCount > 0 && <span className="ml-1 opacity-80">({row.itemCount})</span>}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-2.5 text-xs text-neutral-500">
          <span>
            Trang {page + 1}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-neutral-300 px-2.5 py-1 disabled:opacity-40"
            >
              ← Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-neutral-300 px-2.5 py-1 disabled:opacity-40"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
      {openRow && (
        <DetailTable
          key={openRow.id}
          title={`${detail?.title || "Chi tiết"}: ${firstText(openRow.data)}`}
          columns={detail?.columns ?? []}
          items={openRow.items}
          onClose={() => setOpenRowId(null)}
        />
      )}
    </div>
  );
}
