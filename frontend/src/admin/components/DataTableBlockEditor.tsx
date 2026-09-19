import { useEffect, useState } from "react";
import { adminApi, ApiError } from "../api";
import type { DataTableColumn, DataTableGroup, PageBlockView, PageTableRowView } from "../types";
import { Button, Select, TextInput } from "./ui";
import { ClipIcon } from "./glyphs";
import { RowItemsModal } from "./RowItemsModal";

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface Props {
  block: PageBlockView;
  onBlockChanged: (updated: PageBlockView) => void;
}

export function DataTableBlockEditor({ block, onBlockChanged }: Props) {
  const columns = (block.config.columns as DataTableColumn[] | undefined) ?? [];
  const groups = (block.config.groups as DataTableGroup[] | undefined) ?? [];
  const groupLabel = block.config.groupLabel as string | null | undefined;

  const [rows, setRows] = useState<PageTableRowView[]>(block.rows);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadingCell, setUploadingCell] = useState<string | null>(null);
  const [itemsRow, setItemsRow] = useState<PageTableRowView | null>(null);
  const detail = block.config.detail as { enabled?: boolean; buttonLabel?: string; columns?: { key: string; label: string }[] } | undefined;

  useEffect(() => setRows(block.rows), [block.rows]);

  async function saveBlockConfig(patch: Record<string, unknown>) {
    try {
      const updated = await adminApi.pages.blocks.update(block.id, {
        type: block.type,
        title: block.title,
        config: { ...block.config, ...patch },
      });
      onBlockChanged({ ...updated, rows });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu cấu hình bảng thất bại.");
    }
  }

  function addGroup() {
    const name = newGroupName.trim();
    if (!name) return;
    const group: DataTableGroup = { key: randomKey(), name };
    void saveBlockConfig({ groups: [...groups, group] });
    setNewGroupName("");
  }

  function removeGroup(key: string) {
    void saveBlockConfig({ groups: groups.filter((g) => g.key !== key) });
  }

  function addColumn() {
    const column: DataTableColumn = { key: randomKey(), label: "Cột mới", type: "TEXT" };
    void saveBlockConfig({ columns: [...columns, column] });
  }

  function updateColumn(key: string, patch: Partial<DataTableColumn>) {
    void saveBlockConfig({ columns: columns.map((c) => (c.key === key ? { ...c, ...patch } : c)) });
  }

  function removeColumn(key: string) {
    void saveBlockConfig({ columns: columns.filter((c) => c.key !== key) });
  }

  async function addRow() {
    setError(null);
    try {
      const row = await adminApi.pages.rows.create(block.id, { groupKey: groups[0]?.key ?? null, data: {} });
      setRows((prev) => [...prev, row]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Thêm dòng thất bại.");
    }
  }

  async function saveRow(row: PageTableRowView) {
    try {
      await adminApi.pages.rows.update(row.id, { groupKey: row.groupKey, data: row.data });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu dòng thất bại.");
    }
  }

  function updateRowLocal(rowId: number, patch: Partial<PageTableRowView>) {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  }

  function updateCellLocal(rowId: number, columnKey: string, value: unknown) {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, data: { ...r.data, [columnKey]: value } } : r)));
  }

  async function removeRow(rowId: number) {
    setError(null);
    try {
      await adminApi.pages.rows.remove(rowId);
      setRows((prev) => prev.filter((r) => r.id !== rowId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá dòng thất bại.");
    }
  }

  async function moveRow(rowId: number, direction: "UP" | "DOWN") {
    try {
      await adminApi.pages.rows.move(rowId, direction);
      const list = await adminApi.pages.blocks.list(block.categoryId);
      const fresh = list.find((b) => b.id === block.id);
      if (fresh) setRows(fresh.rows);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sắp xếp dòng thất bại.");
    }
  }

  async function uploadCellFile(rowId: number, columnKey: string, file: File) {
    setUploadingCell(`${rowId}:${columnKey}`);
    setError(null);
    try {
      const media = await adminApi.media.upload(file, "page-tables");
      const value = { mediaId: media.id, url: media.url, name: media.originalName };
      updateCellLocal(rowId, columnKey, value);
      const row = rows.find((r) => r.id === rowId);
      if (row) await saveRow({ ...row, data: { ...row.data, [columnKey]: value } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tải tệp thất bại.");
    } finally {
      setUploadingCell(null);
    }
  }

  function renderCell(row: PageTableRowView, column: DataTableColumn) {
    const raw = row.data[column.key];

    if (column.type === "TEXT") {
      return (
        <TextInput
          value={(raw as string) ?? ""}
          onChange={(e) => updateCellLocal(row.id, column.key, e.target.value)}
          onBlur={() => void saveRow(row)}
          className="min-w-40"
        />
      );
    }

    if (column.type === "DATE") {
      return (
        <TextInput
          type="date"
          value={(raw as string) ?? ""}
          onChange={(e) => updateCellLocal(row.id, column.key, e.target.value)}
          onBlur={() => void saveRow(row)}
        />
      );
    }

    if (column.type === "LINK") {
      const link = (raw as { url?: string; label?: string } | undefined) ?? {};
      return (
        <div className="flex min-w-48 flex-col gap-1">
          <TextInput
            placeholder="https://…"
            value={link.url ?? ""}
            onChange={(e) => updateCellLocal(row.id, column.key, { ...link, url: e.target.value })}
            onBlur={() => void saveRow(row)}
          />
          <TextInput
            placeholder="Nhãn nút (vd: Xem chi tiết)"
            value={link.label ?? ""}
            onChange={(e) => updateCellLocal(row.id, column.key, { ...link, label: e.target.value })}
            onBlur={() => void saveRow(row)}
          />
        </div>
      );
    }

    // FILE
    const file = (raw as { url?: string; name?: string } | undefined) ?? {};
    const busy = uploadingCell === `${row.id}:${column.key}`;
    return (
      <div className="flex min-w-40 items-center gap-1.5">
        {file.url ? (
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-brand-600 hover:underline">
            <ClipIcon /> {file.name}
          </a>
        ) : (
          <span className="text-xs text-neutral-400">— chưa có tệp —</span>
        )}
        <label className="cursor-pointer rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-50">
          {busy ? "Đang tải…" : file.url ? "Đổi" : "+ Tệp"}
          <input
            type="file"
            className="hidden"
            disabled={busy}
            onChange={(e) => e.target.files?.[0] && void uploadCellFile(row.id, column.key, e.target.files[0])}
          />
        </label>
      </div>
    );
  }

  async function reloadBlock() {
    const list = await adminApi.pages.blocks.list(block.categoryId);
    const fresh = list.find((b) => b.id === block.id);
    if (fresh) onBlockChanged(fresh);
  }

  return (
    <div className="space-y-4 rounded-md border border-neutral-200 bg-neutral-50/60 p-3">
      {itemsRow && (
        <RowItemsModal
          row={itemsRow}
          title={(block.config.detail as { title?: string } | undefined)?.title ?? "Chi tiết"}
          columns={detail?.columns ?? []}
          onClose={() => setItemsRow(null)}
          onChanged={() => void reloadBlock()}
        />
      )}
      {error && <p className="text-xs text-urgent-600">{error}</p>}

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Cột dữ liệu</p>
        <div className="space-y-1.5">
          {columns.map((col) => (
            <div key={col.key} className="flex items-center gap-1.5">
              <TextInput
                value={col.label}
                onChange={(e) => updateColumn(col.key, { label: e.target.value })}
                className="max-w-48"
              />
              <Select value={col.type} onChange={(e) => updateColumn(col.key, { type: e.target.value as DataTableColumn["type"] })} className="max-w-32">
                <option value="TEXT">Văn bản</option>
                <option value="DATE">Ngày</option>
                <option value="LINK">Liên kết</option>
                <option value="FILE">Tệp tải về</option>
              </Select>
              <button onClick={() => removeColumn(col.key)} className="text-xs text-urgent-600 hover:underline">
                Xoá cột
              </button>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={addColumn}>
            + Thêm cột
          </Button>
        </div>
      </div>

      {groupLabel && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Nhóm lọc ({groupLabel})</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {groups.map((g) => (
              <span key={g.key} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs text-neutral-700 shadow-sm">
                {g.name}
                <button onClick={() => removeGroup(g.key)} className="text-urgent-600 hover:text-urgent-700">
                  ×
                </button>
              </span>
            ))}
            <TextInput
              placeholder="Tên nhóm mới…"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGroup()}
              className="max-w-40"
            />
            <Button size="sm" variant="secondary" onClick={addGroup}>
              + Thêm nhóm
            </Button>
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">Dữ liệu ({rows.length} dòng)</p>
        {columns.length === 0 ? (
          <p className="text-xs text-neutral-400">Thêm ít nhất 1 cột trước khi nhập dữ liệu.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-3 py-2 font-medium">#</th>
                  {groupLabel && <th className="px-3 py-2 font-medium">{groupLabel}</th>}
                  {columns.map((c) => (
                    <th key={c.key} className="px-3 py-2 font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className="border-b border-neutral-100 last:border-0 align-top">
                    <td className="px-3 py-2 text-neutral-400">{i + 1}</td>
                    {groupLabel && (
                      <td className="px-3 py-2">
                        <Select
                          value={row.groupKey ?? ""}
                          onChange={(e) => {
                            updateRowLocal(row.id, { groupKey: e.target.value || null });
                            void saveRow({ ...row, groupKey: e.target.value || null });
                          }}
                          className="min-w-32"
                        >
                          <option value="">— Không —</option>
                          {groups.map((g) => (
                            <option key={g.key} value={g.key}>
                              {g.name}
                            </option>
                          ))}
                        </Select>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2">
                        {renderCell(row, col)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {detail?.enabled && (
                          <button onClick={() => setItemsRow(row)} className="rounded-md border border-brand-300 px-2 py-0.5 text-xs font-semibold text-brand-700 hover:bg-brand-50">
                            Chi tiết ({row.itemCount})
                          </button>
                        )}
                        <button onClick={() => void moveRow(row.id, "UP")} className="text-neutral-400 hover:text-neutral-700" title="Lên">
                          ↑
                        </button>
                        <button onClick={() => void moveRow(row.id, "DOWN")} className="text-neutral-400 hover:text-neutral-700" title="Xuống">
                          ↓
                        </button>
                        <button onClick={() => void removeRow(row.id)} className="text-xs text-urgent-600 hover:underline">
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-2">
          <Button size="sm" variant="secondary" onClick={addRow} disabled={columns.length === 0}>
            + Thêm dòng
          </Button>
        </div>
      </div>
    </div>
  );
}
