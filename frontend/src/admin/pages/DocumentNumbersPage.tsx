import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, ApiError, type DocumentNumberRequest } from "../api";
import type { DocumentNumber, DocumentType } from "../types";
import { formatDate } from "../../lib/format";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Textarea } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AttachmentPreviewModal } from "../components/AttachmentPreviewModal";
import clsx from "clsx";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);
const BADGE_TONES = ["brand", "accent", "warn", "urgent", "neutral"] as const;

type SortMode = "TYPE" | "DATE";

interface FormState {
  documentTypeId: number | null;
  title: string;
  person: string;
  issueDate: string;
  note: string;
  senderUnit: string;
  originalRef: string;
  receivedDate: string;
  numberInt: number | null;
}

function emptyForm(typeId: number | null): FormState {
  return {
    documentTypeId: typeId,
    title: "",
    person: "",
    issueDate: new Date().toISOString().slice(0, 10),
    note: "",
    senderUnit: "",
    originalRef: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    numberInt: null,
  };
}

export function DocumentNumbersPage() {
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [year, setYear] = useState(CURRENT_YEAR);
  const [rows, setRows] = useState<DocumentNumber[]>([]);
  const [typeFilter, setTypeFilter] = useState<number | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("TYPE");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<DocumentNumber | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(null));
  const [formError, setFormError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [nextNumberHint, setNextNumberHint] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<DocumentNumber | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState<{ id: number; filename: string } | null>(null);

  const typeById = useMemo(() => new Map(types.map((t) => [t.id, t])), [types]);

  function load() {
    setLoading(true);
    setError(null);
    adminApi.documentTypes
      .list()
      .then((typeList) => {
        setTypes(typeList);
        return Promise.all(
          typeList.map((t) =>
            adminApi.documentNumbers.list(t.id, year).catch(() => [] as DocumentNumber[]),
          ),
        );
      })
      .then((lists) => setRows(lists.flat()))
      .catch(() => setError("Không thể tải sổ văn bản."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [year]);

  const visibleRows = useMemo(() => {
    let list = rows;
    if (typeFilter !== "ALL") list = list.filter((r) => r.documentTypeId === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.numberDisplay.toLowerCase().includes(q) ||
          (r.person ?? "").toLowerCase().includes(q) ||
          (r.senderUnit ?? "").toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sortMode === "DATE") {
      sorted.sort((a, b) => (b.issueDate < a.issueDate ? -1 : b.issueDate > a.issueDate ? 1 : 0));
    } else {
      sorted.sort((a, b) => {
        const ta = typeById.get(a.documentTypeId)?.sortOrder ?? 0;
        const tb = typeById.get(b.documentTypeId)?.sortOrder ?? 0;
        if (ta !== tb) return ta - tb;
        return b.numberInt - a.numberInt;
      });
    }
    return sorted;
  }, [rows, typeFilter, search, sortMode, typeById]);

  function typeTone(typeId: number) {
    const idx = types.findIndex((t) => t.id === typeId);
    return BADGE_TONES[idx % BADGE_TONES.length];
  }

  async function openCreate() {
    const defaultTypeId = typeFilter !== "ALL" ? typeFilter : types[0]?.id ?? null;
    setEditing(null);
    setForm(emptyForm(defaultTypeId));
    setFormError(null);
    setDuplicateWarning(false);
    setNextNumberHint(null);
    setDrawerOpen(true);
    if (defaultTypeId) void refreshNextNumber(defaultTypeId);
  }

  function openEdit(dn: DocumentNumber) {
    setEditing(dn);
    setForm({
      documentTypeId: dn.documentTypeId,
      title: dn.title,
      person: dn.person ?? "",
      issueDate: dn.issueDate,
      note: dn.note ?? "",
      senderUnit: dn.senderUnit ?? "",
      originalRef: dn.originalRef ?? "",
      receivedDate: dn.receivedDate ?? "",
      numberInt: dn.numberInt,
    });
    setFormError(null);
    setDuplicateWarning(false);
    setNextNumberHint(null);
    setDrawerOpen(true);
  }

  async function refreshNextNumber(typeId: number) {
    try {
      const { nextNumber } = await adminApi.documentNumbers.next(typeId, year);
      setNextNumberHint(nextNumber);
      setForm((f) => (f.documentTypeId === typeId && !f.numberInt ? { ...f, numberInt: nextNumber } : f));
    } catch {
      setNextNumberHint(null);
    }
  }

  function handleTypeChange(typeId: number) {
    setForm((f) => ({ ...f, documentTypeId: typeId, numberInt: null }));
    void refreshNextNumber(typeId);
  }

  const selectedType = form.documentTypeId ? typeById.get(form.documentTypeId) ?? null : null;
  const isIncoming = selectedType?.direction === "INCOMING";

  async function handleSave(confirmDuplicate = false) {
    if (!form.documentTypeId || !form.numberInt) return;
    setSaving(true);
    setFormError(null);
    const body: DocumentNumberRequest = {
      documentTypeId: form.documentTypeId,
      year,
      numberInt: form.numberInt,
      title: form.title,
      person: !isIncoming ? form.person : null,
      issueDate: form.issueDate,
      note: form.note,
      senderUnit: isIncoming ? form.senderUnit : null,
      originalRef: isIncoming ? form.originalRef : null,
      receivedDate: isIncoming ? form.receivedDate : null,
      confirmDuplicate,
    };
    try {
      if (editing) await adminApi.documentNumbers.update(editing.id, body);
      else await adminApi.documentNumbers.create(body);
      setDrawerOpen(false);
      load();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setDuplicateWarning(true);
        setFormError(err.message);
      } else {
        setFormError(err instanceof ApiError ? err.message : "Lưu văn bản thất bại.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.documentNumbers.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá văn bản thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sổ văn bản"
        description={`Toàn bộ số văn bản đi/đến năm ${year} — tất cả các loại trên cùng một danh sách.`}
        actions={
          <div className="flex items-center gap-2">
            {typeFilter !== "ALL" && (
              <a
                href={adminApi.documentNumbers.exportUrl(typeFilter, year)}
                className="rounded-md border border-neutral-300 bg-white px-3.5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Xuất Excel
              </a>
            )}
            <Button onClick={openCreate}>+ Lấy số mới</Button>
          </div>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="max-w-28">
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
        <TextInput
          placeholder="Tìm theo trích yếu, số, người lập…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="ml-auto flex items-center gap-1 rounded-md border border-neutral-300 bg-white p-0.5 text-xs">
          <button
            onClick={() => setSortMode("TYPE")}
            className={clsx("rounded px-2 py-1 font-medium", sortMode === "TYPE" ? "bg-brand-600 text-white" : "text-neutral-600")}
          >
            Theo loại
          </button>
          <button
            onClick={() => setSortMode("DATE")}
            className={clsx("rounded px-2 py-1 font-medium", sortMode === "DATE" ? "bg-brand-600 text-white" : "text-neutral-600")}
          >
            Mới nhất
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <TypeChip label={`Tất cả (${rows.length})`} active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")} />
        {types.map((t) => {
          const count = rows.filter((r) => r.documentTypeId === t.id).length;
          return (
            <TypeChip
              key={t.id}
              label={`${t.name} (${count})`}
              active={typeFilter === t.id}
              onClick={() => setTypeFilter(t.id)}
            />
          );
        })}
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && visibleRows.length === 0 && <EmptyState title="Không có văn bản nào phù hợp" description="Thử đổi bộ lọc hoặc bấm “Lấy số mới” để đăng ký." />}

      {!loading && visibleRows.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-2 font-medium">Loại</th>
                <th className="px-4 py-2 font-medium">Số ký hiệu</th>
                <th className="px-4 py-2 font-medium">Trích yếu</th>
                <th className="px-4 py-2 font-medium">Người lập / Đơn vị gửi</th>
                <th className="px-4 py-2 font-medium">Ngày</th>
                <th className="px-4 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((dn) => {
                const type = typeById.get(dn.documentTypeId);
                const incoming = type?.direction === "INCOMING";
                const fromWeb = !!dn.senderEmail;
                const isExpanded = expandedId === dn.id;
                return (
                  <Fragment key={dn.id}>
                    <tr className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-2.5">
                        <Badge tone={typeTone(dn.documentTypeId)}>{type?.name ?? "—"}</Badge>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-neutral-700">
                        {fromWeb ? (
                          <button onClick={() => setExpandedId(isExpanded ? null : dn.id)} className="underline decoration-dotted underline-offset-2 hover:text-brand-600">
                            {dn.numberDisplay}
                          </button>
                        ) : (
                          dn.numberDisplay
                        )}
                      </td>
                      <td className="px-4 py-2.5 max-w-md text-neutral-900">
                        {dn.title}
                        {fromWeb && <Badge tone="brand">Nộp qua web</Badge>}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-500">{incoming ? dn.senderUnit : dn.person}</td>
                      <td className="px-4 py-2.5 text-neutral-500">{formatDate(incoming ? dn.receivedDate : dn.issueDate)}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEdit(dn)}>Sửa</Button>
                          <Button size="sm" variant="danger" onClick={() => setToDelete(dn)}>Xoá</Button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && fromWeb && (
                      <tr className="border-b border-neutral-100 bg-brand-50/30">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-600">
                            <span><strong className="text-neutral-800">Email:</strong> {dn.senderEmail}</span>
                            {dn.senderPhone && <span><strong className="text-neutral-800">Điện thoại:</strong> {dn.senderPhone}</span>}
                            {dn.attachmentUrl && (
                              <button
                                onClick={() => setPreviewing({ id: dn.id, filename: dn.attachmentName ?? "Tệp đính kèm" })}
                                className="font-medium text-brand-600 hover:underline"
                              >
                                📎 {dn.attachmentName ?? "Xem tệp đính kèm"}
                              </button>
                            )}
                            {dn.taskId && (
                              <Link to="/admin/nhiem-vu" className="font-medium text-brand-600 hover:underline">
                                Xem nhiệm vụ liên kết →
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa văn bản" : "Lấy số văn bản mới"}>
        <div className="space-y-4">
          <Field label="Loại văn bản" required>
            <Select
              value={form.documentTypeId ?? ""}
              disabled={!!editing}
              onChange={(e) => handleTypeChange(Number(e.target.value))}
            >
              <option value="">— Chọn loại —</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.direction === "OUTGOING" ? "đi" : "đến"})
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Số văn bản"
            required
            hint={nextNumberHint !== null && !editing ? `Số tiếp theo gợi ý cho năm ${year}: ${nextNumberHint}` : undefined}
          >
            <TextInput
              type="number"
              value={form.numberInt ?? ""}
              onChange={(e) => setForm({ ...form, numberInt: e.target.value ? Number(e.target.value) : null })}
            />
          </Field>

          <Field label="Trích yếu / Tiêu đề" required>
            <Textarea rows={2} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>

          {isIncoming ? (
            <>
              <Field label="Đơn vị gửi">
                <TextInput value={form.senderUnit} onChange={(e) => setForm({ ...form, senderUnit: e.target.value })} />
              </Field>
              <Field label="Số hiệu gốc" hint="Số văn bản do đơn vị gửi ban hành">
                <TextInput value={form.originalRef} onChange={(e) => setForm({ ...form, originalRef: e.target.value })} />
              </Field>
              <Field label="Ngày nhận" required>
                <TextInput type="date" value={form.receivedDate} onChange={(e) => setForm({ ...form, receivedDate: e.target.value })} />
              </Field>
            </>
          ) : (
            <Field label="Người lập">
              <TextInput value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} />
            </Field>
          )}

          <Field label="Ngày ban hành" required>
            <TextInput type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
          </Field>

          <Field label="Ghi chú">
            <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>

          {formError && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {formError}
              {duplicateWarning && (
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => handleSave(true)}>
                  Vẫn lưu số này
                </Button>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={() => handleSave(false)} disabled={saving || !form.title.trim() || !form.numberInt || !form.documentTypeId}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá số văn bản "${toDelete?.numberDisplay}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />

      {previewing && (
        <AttachmentPreviewModal
          documentNumberId={previewing.id}
          filename={previewing.filename}
          onClose={() => setPreviewing(null)}
        />
      )}
    </div>
  );
}

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-brand-600 bg-brand-600 text-white" : "border-neutral-300 bg-white text-neutral-600 hover:border-brand-300",
      )}
    >
      {label}
    </button>
  );
}
