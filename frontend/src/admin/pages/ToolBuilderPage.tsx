import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi, ApiError } from "../api";
import type { ToolRow, ToolSubmission, ToolView } from "../types";
import type { ToolColumn, ToolField, ToolFieldType } from "../../lib/types";
import { Badge, Button, Card, Checkbox, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Textarea } from "../components/ui";
import { formatDateTime } from "../../lib/format";

const FIELD_TYPES: { value: ToolFieldType; label: string }[] = [
  { value: "TEXT", label: "Văn bản ngắn" },
  { value: "TEXTAREA", label: "Văn bản dài" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Số điện thoại" },
  { value: "NUMBER", label: "Số" },
  { value: "DATE", label: "Ngày" },
  { value: "SELECT", label: "Chọn 1 trong danh sách" },
  { value: "CHECKBOX", label: "Ô đánh dấu (đồng ý…)" },
  { value: "FILE", label: "Đính kèm tệp" },
];

const STATUS_LABEL = { MOI: "Mới", DA_XU_LY: "Đã xử lý", TU_CHOI: "Từ chối" } as const;
const STATUS_TONE = { MOI: "warn", DA_XU_LY: "accent", TU_CHOI: "urgent" } as const;

function newKey(): string {
  return "f" + Math.random().toString(36).slice(2, 8);
}

export function ToolBuilderPage() {
  const id = Number(useParams().id);
  const [tool, setTool] = useState<ToolView | null>(null);
  const [tab, setTab] = useState<"design" | "data">("design");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function apply(t: ToolView) {
    setTool(t);
    setName(t.name);
    setSlug(t.slug);
    setDescription(t.description ?? "");
    setActive(t.active);
    setConfig(t.config);
  }

  function load() {
    adminApi.tools
      .get(id)
      .then(apply)
      .catch(() => setError("Không tìm thấy chức năng này."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      apply(await adminApi.tools.update(id, { name, slug, description, active, config }));
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu thất bại.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!tool) return <ErrorBanner message={error ?? "Không tìm thấy chức năng."} />;

  const fields = (config.fields as ToolField[] | undefined) ?? [];
  const columns = (config.columns as ToolColumn[] | undefined) ?? [];
  const setFields = (f: ToolField[]) => setConfig({ ...config, fields: f });
  const setColumns = (c: ToolColumn[]) => setConfig({ ...config, columns: c });

  function patchField(i: number, patch: Partial<ToolField>) {
    setFields(fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function moveField(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const copy = [...fields];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setFields(copy);
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={tool.name}
        description={tool.kind === "FORM" ? "Biểu mẫu thu thập thông tin" : "Bảng tra cứu"}
        actions={
          <>
            <Link to="/admin/cong-cu">
              <Button variant="secondary" size="sm">
                ← Danh sách
              </Button>
            </Link>
            <a href={`/cong-cu/${tool.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm">
                Xem trang công khai
              </Button>
            </a>
            {saved && <span className="text-sm font-semibold text-accent-700">Đã lưu.</span>}
            <Button onClick={save} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu thay đổi"}
            </Button>
          </>
        }
      />
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="mb-4 flex gap-1 border-b border-neutral-300">
        {(
          [
            ["design", "Thiết kế"],
            ["data", tool.kind === "FORM" ? `Hồ sơ nhận được${tool.pending ? ` (${tool.pending} mới)` : ""}` : `Dữ liệu (${tool.rowCount} dòng)`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold ${tab === key ? "border-brand-700 text-brand-800" : "border-transparent text-neutral-500 hover:text-neutral-800"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "design" && (
        <div className="space-y-5">
          <Card className="grid gap-4 p-4 md:grid-cols-2">
            <Field label="Tên chức năng" required>
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Đường dẫn" hint="Trang công khai: /cong-cu/đường-dẫn">
              <TextInput value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Mô tả (hiện dưới tiêu đề)">
                <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </Field>
            </div>
            <Checkbox label="Đang hiển thị công khai (bỏ chọn để tạm dừng)" checked={active} onChange={(e) => setActive(e.target.checked)} />
          </Card>

          {tool.kind === "FORM" && (
            <>
              <Card>
                <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-100 px-4 py-2">
                  <p className="text-xs font-bold uppercase tracking-[0.06em] text-neutral-800">Các trường người dùng phải điền</p>
                  <Button size="sm" onClick={() => setFields([...fields, { key: newKey(), label: "Trường mới", type: "TEXT", required: false, hint: "", options: [] }])}>
                    + Thêm trường
                  </Button>
                </div>
                {fields.length === 0 && <p className="px-4 py-6 text-sm text-neutral-500">Chưa có trường nào. Bấm “Thêm trường” để bắt đầu.</p>}
                <ul className="divide-y divide-neutral-200">
                  {fields.map((f, i) => (
                    <li key={f.key} className="grid gap-3 p-4 md:grid-cols-[1fr_200px_auto]">
                      <div className="space-y-2">
                        <TextInput value={f.label} onChange={(e) => patchField(i, { label: e.target.value })} aria-label="Tên trường" />
                        <TextInput value={f.hint} onChange={(e) => patchField(i, { hint: e.target.value })} placeholder="Gợi ý dưới ô nhập (không bắt buộc)" aria-label="Gợi ý" />
                        {f.type === "SELECT" && (
                          <Textarea
                            rows={3}
                            value={f.options.join("\n")}
                            onChange={(e) => patchField(i, { options: e.target.value.split("\n") })}
                            placeholder={"Mỗi dòng một lựa chọn\nVí dụ: Khoa CNTT\nKhoa Kinh tế"}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Select value={f.type} onChange={(e) => patchField(i, { type: e.target.value as ToolFieldType })} aria-label="Kiểu trường">
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </Select>
                        <Checkbox label="Bắt buộc" checked={f.required} onChange={(e) => patchField(i, { required: e.target.checked })} />
                      </div>
                      <div className="flex items-start gap-1">
                        <Button size="sm" variant="secondary" onClick={() => moveField(i, -1)} disabled={i === 0} aria-label="Lên">
                          ↑
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => moveField(i, 1)} disabled={i === fields.length - 1} aria-label="Xuống">
                          ↓
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => setFields(fields.filter((_, idx) => idx !== i))}>
                          Xoá
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="grid gap-4 p-4 md:grid-cols-2">
                <Field label="Nhãn nút gửi">
                  <TextInput value={(config.submitLabel as string) ?? ""} onChange={(e) => setConfig({ ...config, submitLabel: e.target.value })} />
                </Field>
                <div className="pt-6">
                  <Checkbox
                    label="Cho người gửi tra cứu tình trạng bằng mã hồ sơ"
                    checked={config.trackable !== false}
                    onChange={(e) => setConfig({ ...config, trackable: e.target.checked })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Field label="Lời nhắn sau khi gửi thành công">
                    <Textarea rows={3} value={(config.successMessage as string) ?? ""} onChange={(e) => setConfig({ ...config, successMessage: e.target.value })} />
                  </Field>
                </div>
              </Card>
            </>
          )}

          {tool.kind === "LOOKUP" && (
            <Card className="grid gap-4 p-4 md:grid-cols-2">
              <Field label="Câu hỏi ở ô tra cứu" hint="Ví dụ: Nhập mã số sinh viên">
                <TextInput value={(config.keyLabel as string) ?? ""} onChange={(e) => setConfig({ ...config, keyLabel: e.target.value })} />
              </Field>
              <Field label="Cột dùng để tra cứu (khớp chính xác)" hint="Người dùng phải nhập đúng giá trị của cột này mới ra kết quả — tránh bị dò cả danh sách.">
                <Select
                  value={(config.keyColumn as string) ?? ""}
                  disabled={columns.length === 0}
                  onChange={async (e) => {
                    setConfig({ ...config, keyColumn: e.target.value });
                    try {
                      await adminApi.tools.setKeyColumn(id, e.target.value);
                    } catch (err) {
                      setError(err instanceof ApiError ? err.message : "Đổi cột khoá thất bại.");
                    }
                  }}
                >
                  {columns.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Thông báo khi không tìm thấy">
                  <TextInput value={(config.notFoundMessage as string) ?? ""} onChange={(e) => setConfig({ ...config, notFoundMessage: e.target.value })} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <p className="mb-2 text-[13px] font-semibold text-neutral-800">Cột hiển thị trong kết quả</p>
                {columns.length === 0 ? (
                  <p className="text-sm text-neutral-500">Chưa có cột — nhập file Excel ở thẻ “Dữ liệu”, các cột sẽ tự tạo từ dòng tiêu đề.</p>
                ) : (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {columns.map((c, i) => (
                      <li key={c.key} className="flex items-center gap-2 border border-neutral-300 px-3 py-2">
                        <input type="checkbox" checked={c.show} onChange={(e) => setColumns(columns.map((x, idx) => (idx === i ? { ...x, show: e.target.checked } : x)))} className="h-4 w-4" aria-label={`Hiện cột ${c.label}`} />
                        <TextInput value={c.label} onChange={(e) => setColumns(columns.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))} />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-neutral-500">Bỏ chọn cột nhạy cảm (ngày sinh, mật khẩu…) để không hiện ra cho người tra cứu.</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {tab === "data" && tool.kind === "FORM" && <SubmissionsPanel tool={tool} fields={fields} onChanged={load} />}
      {tab === "data" && tool.kind === "LOOKUP" && <RowsPanel tool={tool} onChanged={load} />}
    </div>
  );
}

function SubmissionsPanel({ tool, fields, onChanged }: { tool: ToolView; fields: ToolField[]; onChanged: () => void }) {
  const [items, setItems] = useState<ToolSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});

  function load() {
    adminApi.tools
      .submissions(tool.id)
      .then((list) => {
        setItems(list);
        setNotes(Object.fromEntries(list.map((s) => [s.id, s.resultMessage ?? ""])));
      })
      .catch(() => setError("Không tải được hồ sơ."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [tool.id]);

  async function setStatus(s: ToolSubmission, status: string) {
    try {
      const updated = await adminApi.tools.updateSubmission(s.id, { status, resultMessage: notes[s.id] ?? "" });
      setItems((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Cập nhật thất bại.");
    }
  }

  async function remove(s: ToolSubmission) {
    try {
      await adminApi.tools.removeSubmission(s.id);
      load();
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá thất bại.");
    }
  }

  if (loading) return <LoadingState />;
  return (
    <div className="space-y-3">
      {error && <ErrorBanner message={error} />}
      {items.length === 0 && <EmptyState title="Chưa có hồ sơ nào" description="Hồ sơ người dùng gửi từ trang công khai sẽ hiện ở đây." />}
      {items.map((s) => (
        <Card key={s.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-sm font-bold text-neutral-900">
              {s.code} <span className="ml-2 font-sans text-xs font-normal text-neutral-500">{formatDateTime(s.createdAt)}</span>
            </p>
            <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</Badge>
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {fields.map((f) => {
              const v = s.data[f.key];
              const isFile = v && typeof v === "object";
              return (
                <div key={f.key}>
                  <dt className="text-xs font-semibold text-neutral-500">{f.label}</dt>
                  <dd className="break-words text-sm text-neutral-900">
                    {isFile ? (
                      <a href={adminApi.tools.fileUrl(s.id, f.key)} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                        {String((v as { name?: string }).name ?? "Tệp đính kèm")}
                      </a>
                    ) : v ? (
                      String(v)
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
          <div className="mt-4 border-t border-neutral-200 pt-3">
            <Textarea rows={2} value={notes[s.id] ?? ""} onChange={(e) => setNotes({ ...notes, [s.id]: e.target.value })} placeholder="Kết quả xử lý gửi cho người dùng (họ thấy khi tra cứu bằng mã hồ sơ)" />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void setStatus(s, "DA_XU_LY")}>
                Đã xử lý
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void setStatus(s, "TU_CHOI")}>
                Từ chối
              </Button>
              <Button size="sm" variant="secondary" onClick={() => void setStatus(s, "MOI")}>
                Mở lại
              </Button>
              <Button size="sm" variant="danger" className="ml-auto" onClick={() => void remove(s)}>
                Xoá
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RowsPanel({ tool, onChanged }: { tool: ToolView; onChanged: () => void }) {
  const [rows, setRows] = useState<ToolRow[]>([]);
  const [q, setQ] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ rowCount?: number; headers?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const columns = (tool.config.columns as ToolColumn[] | undefined) ?? [];

  function load(query = q) {
    adminApi.tools.rows(tool.id, query).then(setRows).catch(() => setError("Không tải được dữ liệu."));
  }

  useEffect(() => load(""), [tool.id, tool.rowCount]);

  async function run(commit: boolean) {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const res = await adminApi.tools.importRows(tool.id, file, commit);
      if (commit) {
        setMsg(`Đã thay thế dữ liệu bằng ${res.importedCount} dòng.`);
        setFile(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
        onChanged();
      } else {
        setPreview(res);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không đọc được file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <p className="text-sm font-bold text-neutral-900">Nhập dữ liệu từ Excel</p>
        <p className="mb-3 mt-1 text-xs text-neutral-600">
          Dòng đầu tiên là tiêu đề cột. Mỗi lần nhập sẽ <strong>thay thế toàn bộ</strong> dữ liệu cũ. Cột tra cứu mặc định là cột đầu tiên (đổi ở thẻ Thiết kế).
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
              Xác nhận thay bằng {preview.rowCount} dòng
            </Button>
          )}
        </div>
        {preview && (
          <p className="mt-2 text-sm text-neutral-700">
            {preview.rowCount} dòng · cột: {preview.headers?.join(", ")}
          </p>
        )}
        {msg && <p className="mt-2 text-sm font-semibold text-accent-700">{msg}</p>}
        {error && <p className="mt-2 text-sm text-urgent-600">{error}</p>}
      </Card>

      <div className="flex gap-2">
        <TextInput placeholder="Tìm trong dữ liệu…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} className="max-w-sm" />
        <Button size="sm" variant="secondary" onClick={() => load()}>
          Tìm
        </Button>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Chưa có dữ liệu" description="Nhập file Excel ở trên để bắt đầu." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase">
                {columns.map((c) => (
                  <th key={c.key} className="whitespace-nowrap px-3 py-2">
                    {c.label}
                    {c.key === tool.config.keyColumn && <span className="ml-1 text-brand-700">(khoá)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 text-neutral-800">
                      {String(r.data[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
