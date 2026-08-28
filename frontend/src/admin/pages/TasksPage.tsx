import { useEffect, useState } from "react";
import { adminApi, ApiError, type TaskRequest, type TaskStepRequest } from "../api";
import type { Member, TaskScope, TaskStatus, TaskStepStatus, TaskView } from "../types";
import { useAuth } from "../AuthContext";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Textarea } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR + 1, CURRENT_YEAR, CURRENT_YEAR - 1];

const STATUS_LABELS: Record<TaskStatus, string> = {
  CHUA_BAT_DAU: "Chưa bắt đầu",
  DANG_LAM: "Đang làm",
  HOAN_THANH: "Hoàn thành",
  VUONG_MAC: "Vướng mắc",
  TAM_DUNG: "Tạm dừng",
  HUY: "Huỷ",
};

const STATUS_TONES: Record<TaskStatus, "neutral" | "accent" | "brand" | "urgent" | "warn"> = {
  CHUA_BAT_DAU: "neutral",
  DANG_LAM: "brand",
  HOAN_THANH: "accent",
  VUONG_MAC: "urgent",
  TAM_DUNG: "warn",
  HUY: "neutral",
};

const STEP_STATUS_LABELS: Record<TaskStepStatus, string> = {
  CHUA_BAT_DAU: "Chưa bắt đầu",
  DANG_LAM: "Đang làm",
  HOAN_THANH: "Hoàn thành",
  VUONG_MAC: "Vướng mắc",
};

interface TaskFormState {
  scope: TaskScope;
  year: number;
  quarter: number | null;
  month: number | null;
  title: string;
  description: string;
  assigneeId: number | null;
}

const emptyForm: TaskFormState = { scope: "DEPT", year: CURRENT_YEAR, quarter: null, month: null, title: "", description: "", assigneeId: null };

export function TasksPage() {
  const { user } = useAuth();
  const canManageDept = user?.role === "EDITOR" || user?.role === "ADMIN";

  const [scope, setScope] = useState<TaskScope | "">("");
  const [year, setYear] = useState(CURRENT_YEAR);
  const [tasks, setTasks] = useState<TaskView[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<TaskView | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<TaskView | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    adminApi.tasks
      .list({ scope: scope || undefined, year })
      .then((rows) => setTasks([...rows].sort((a, b) => a.sortOrder - b.sortOrder)))
      .catch(() => setError("Không thể tải nhiệm vụ."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    adminApi.members.list().then(setMembers).catch(() => {});
  }, []);

  useEffect(load, [scope, year]);

  function memberName(id: number | null) {
    if (!id) return "—";
    return members.find((m) => m.id === id)?.name ?? "—";
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, year });
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(t: TaskView) {
    setEditing(t);
    setForm({ scope: t.scope, year: t.year, quarter: t.quarter, month: t.month, title: t.title, description: t.description ?? "", assigneeId: t.assigneeId });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    const body: TaskRequest = {
      scope: form.scope,
      year: form.year,
      quarter: form.quarter,
      month: form.month,
      title: form.title,
      description: form.description,
      assigneeId: form.assigneeId,
    };
    try {
      if (editing) await adminApi.tasks.update(editing.id, body);
      else await adminApi.tasks.create(body);
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu nhiệm vụ thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.tasks.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá nhiệm vụ thất bại.");
      setToDelete(null);
    }
  }

  async function handleStatusChange(t: TaskView, status: TaskStatus) {
    try {
      await adminApi.tasks.setStatus(t.id, status);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể đổi trạng thái nhiệm vụ.");
    }
  }

  function canEditTask(t: TaskView) {
    if (t.scope === "DEPT") return canManageDept;
    return t.ownerUserId === user?.id;
  }

  return (
    <div>
      <PageHeader title="Nhiệm vụ" description="Nhiệm vụ chung của phòng và nhiệm vụ cá nhân." actions={<Button onClick={openCreate}>+ Thêm nhiệm vụ</Button>} />

      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={scope} onChange={(e) => setScope(e.target.value as TaskScope | "")} className="max-w-44">
          <option value="">Tất cả phạm vi</option>
          <option value="DEPT">Chung của phòng</option>
          <option value="PERSONAL">Cá nhân</option>
        </Select>
        <Select value={year} onChange={(e) => setYear(Number(e.target.value))} className="max-w-28">
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && tasks.length === 0 && <EmptyState title="Chưa có nhiệm vụ nào" />}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={t.scope === "DEPT" ? "brand" : "neutral"}>{t.scope === "DEPT" ? "Chung phòng" : "Cá nhân"}</Badge>
                    <Badge tone={STATUS_TONES[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                    <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="text-sm font-semibold text-neutral-900 hover:underline">
                      {t.title}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {t.year}
                    {t.quarter ? ` · Quý ${t.quarter}` : ""}
                    {t.month ? ` · Tháng ${t.month}` : ""} · Phụ trách: {memberName(t.assigneeId)}
                  </p>
                  {t.description && <p className="mt-1 text-sm text-neutral-600">{t.description}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 w-40 overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${t.progressPercent}%` }} />
                    </div>
                    <span className="text-xs tabular-nums text-neutral-500">{t.progressPercent}%</span>
                  </div>
                </div>

                {canEditTask(t) && (
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Select value={t.status} onChange={(e) => handleStatusChange(t, e.target.value as TaskStatus)} className="w-auto text-xs">
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                    <Button size="sm" variant="secondary" onClick={() => openEdit(t)}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => setToDelete(t)}>Xoá</Button>
                  </div>
                )}
              </div>

              <button onClick={() => setExpandedId(expandedId === t.id ? null : t.id)} className="mt-3 text-xs font-medium text-brand-600 hover:underline">
                {expandedId === t.id ? "Ẩn công việc con ▲" : `Công việc con (${t.steps.length}) ▼`}
              </button>

              {expandedId === t.id && <TaskSteps task={t} canEdit={canEditTask(t)} onChanged={load} />}
            </Card>
          ))}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa nhiệm vụ" : "Thêm nhiệm vụ"}>
        <div className="space-y-4">
          <Field label="Phạm vi" required>
            <Select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as TaskScope })} disabled={!!editing}>
              <option value="DEPT" disabled={!canManageDept}>Chung của phòng</option>
              <option value="PERSONAL">Cá nhân</option>
            </Select>
          </Field>
          <Field label="Tiêu đề" required>
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Năm" required>
              <TextInput type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
            </Field>
            <Field label="Quý">
              <Select value={form.quarter ?? ""} onChange={(e) => setForm({ ...form, quarter: e.target.value ? Number(e.target.value) : null, month: e.target.value ? null : form.month })}>
                <option value="">—</option>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    Q{q}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Tháng">
              <Select value={form.month ?? ""} onChange={(e) => setForm({ ...form, month: e.target.value ? Number(e.target.value) : null, quarter: e.target.value ? null : form.quarter })}>
                <option value="">—</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Người phụ trách">
            <Select value={form.assigneeId ?? ""} onChange={(e) => setForm({ ...form, assigneeId: e.target.value ? Number(e.target.value) : null })}>
              <option value="">— Không chọn —</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </Field>

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Huỷ</Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá nhiệm vụ "${toDelete?.title}"?`}
        description="Toàn bộ công việc con của nhiệm vụ này cũng sẽ bị xoá."
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function TaskSteps({ task, canEdit, onChanged }: { task: TaskView; canEdit: boolean; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  async function addStep() {
    if (!newTitle.trim()) return;
    setBusy(true);
    setStepError(null);
    try {
      const body: TaskStepRequest = { title: newTitle, sortOrder: task.steps.length + 1 };
      await adminApi.tasks.addStep(task.id, body);
      setNewTitle("");
      setAdding(false);
      onChanged();
    } catch (err) {
      setStepError(err instanceof ApiError ? err.message : "Không thể thêm công việc con.");
    } finally {
      setBusy(false);
    }
  }

  async function setStepStatus(stepId: number, status: TaskStepStatus) {
    setBusy(true);
    try {
      await adminApi.tasks.setStepStatus(task.id, stepId, status);
      onChanged();
    } catch (err) {
      setStepError(err instanceof ApiError ? err.message : "Không thể đổi trạng thái.");
    } finally {
      setBusy(false);
    }
  }

  async function removeStep(stepId: number) {
    setBusy(true);
    try {
      await adminApi.tasks.removeStep(task.id, stepId);
      onChanged();
    } catch (err) {
      setStepError(err instanceof ApiError ? err.message : "Không thể xoá công việc con.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
      {task.steps.length === 0 && <p className="text-xs text-neutral-400">Chưa có công việc con.</p>}
      {task.steps.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-2 rounded-md bg-neutral-50 px-3 py-1.5">
          <span className="text-sm text-neutral-700">{s.title}</span>
          {canEdit ? (
            <div className="flex items-center gap-2">
              <Select value={s.status} disabled={busy} onChange={(e) => setStepStatus(s.id, e.target.value as TaskStepStatus)} className="w-auto py-1 text-xs">
                {Object.entries(STEP_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <button disabled={busy} onClick={() => removeStep(s.id)} className="text-xs font-medium text-urgent-600 hover:underline">
                Xoá
              </button>
            </div>
          ) : (
            <Badge tone={STATUS_TONES[s.status]}>{STEP_STATUS_LABELS[s.status]}</Badge>
          )}
        </div>
      ))}

      {stepError && <p className="text-xs text-urgent-600">{stepError}</p>}

      {canEdit && (
        <div>
          {adding ? (
            <div className="flex gap-2">
              <TextInput value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Tên công việc con" className="text-sm" autoFocus />
              <Button size="sm" onClick={addStep} disabled={busy || !newTitle.trim()}>Thêm</Button>
              <Button size="sm" variant="secondary" onClick={() => setAdding(false)}>Huỷ</Button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="text-xs font-medium text-brand-600 hover:underline">
              + Thêm công việc con
            </button>
          )}
        </div>
      )}
    </div>
  );
}
