import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { adminApi, ApiError } from "../api";
import type {
  ProcurementDetail,
  ProcurementImportPreview,
  ProcurementItemRow,
  ProcurementStatusRow,
  ProcurementSummary,
  ProcurementUnitRow,
} from "../types";
import type { ProcurementAudience, ProcurementRound } from "../../lib/types";
import { formatDateTime } from "../../lib/format";
import { Badge, Button, Card, Checkbox, EmptyState, ErrorBanner, LoadingState, PageHeader, TextInput } from "../components/ui";

type Tab = "rounds" | "items" | "units";

const AUDIENCES: { value: ProcurementAudience; label: string }[] = [
  { value: "PHONG", label: "Các phòng" },
  { value: "KHOA", label: "Các khoa" },
];

const TABS: { value: Tab; label: string }[] = [
  { value: "rounds", label: "Đợt mua sắm" },
  { value: "items", label: "Danh mục hàng" },
  { value: "units", label: "Đơn vị" },
];

function errMsg(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="tablist" className="inline-flex border border-neutral-300 bg-white">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          type="button"
          onClick={() => onChange(o.value)}
          className={clsx(
            "px-3.5 py-1.5 text-sm font-semibold transition-colors",
            o.value === value ? "bg-brand-700 text-white" : "text-neutral-700 hover:bg-neutral-100",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={clsx("flex max-h-[90vh] w-full flex-col border border-neutral-400 bg-white", wide ? "max-w-3xl" : "max-w-xl")}>
        <div className="flex items-center justify-between border-b border-neutral-300 px-4 py-3">
          <h3 className="text-base font-extrabold text-neutral-900">{title}</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Đóng
          </Button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function ProcurementAdminPage() {
  const [audience, setAudience] = useState<ProcurementAudience>("PHONG");
  const [tab, setTab] = useState<Tab>("rounds");

  return (
    <div>
      <PageHeader
        title="Mua sắm văn phòng phẩm"
        description="Mở đợt theo quý, các đơn vị tự nhập số lượng ở trang công khai /mua-sam, bạn tổng hợp và xuất Excel."
        actions={<Segmented value={audience} options={AUDIENCES} onChange={setAudience} />}
      />
      <div className="mb-4 border-b border-neutral-300">
        <div className="-mb-px flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={clsx(
                "border-b-2 px-4 py-2 text-sm font-bold",
                tab === t.value ? "border-brand-700 text-brand-800" : "border-transparent text-neutral-600 hover:text-neutral-900",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === "rounds" && <RoundsTab key={audience} audience={audience} />}
      {tab === "items" && <ItemsTab key={audience} audience={audience} />}
      {tab === "units" && <UnitsTab key={audience} audience={audience} />}
    </div>
  );
}

/* ------------------------------------------------------------------ Đợt ---- */

function roundState(r: ProcurementRound): { label: string; tone: "accent" | "warn" | "neutral" } {
  if (r.open) return { label: "Đang mở", tone: "accent" };
  if (r.accepting) return { label: "Hết hạn", tone: "warn" };
  return { label: "Đã khóa", tone: "neutral" };
}

function RoundsTab({ audience }: { audience: ProcurementAudience }) {
  const [rounds, setRounds] = useState<ProcurementRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [showPrevious, setShowPrevious] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(
    (selectId?: number | null) => {
      setError(null);
      adminApi.procurement
        .rounds(audience)
        .then((list) => {
          setRounds(list);
          setSelectedId((cur) => {
            if (selectId !== undefined) return selectId;
            if (cur && list.some((r) => r.id === cur)) return cur;
            return list[0]?.id ?? null;
          });
        })
        .catch((e) => setError(errMsg(e, "Không tải được danh sách đợt.")))
        .finally(() => setLoading(false));
    },
    [audience],
  );

  useEffect(() => load(), [load]);

  async function create() {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const r = await adminApi.procurement.createRound({ audience, name: name.trim(), deadlineDate: deadline || null, showPrevious });
      setName("");
      setDeadline("");
      setShowPrevious(false);
      load(r.id);
    } catch (e) {
      setError(errMsg(e, "Không tạo được đợt."));
    } finally {
      setCreating(false);
    }
  }

  const selected = rounds.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-extrabold text-neutral-900">Tạo đợt mới</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[220px] flex-1 text-[13px] font-semibold text-neutral-800">
            Tên đợt
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Quý IV/2026" className="mt-1 font-normal" />
          </label>
          <label className="text-[13px] font-semibold text-neutral-800">
            Hạn chót (để trống = không giới hạn)
            <TextInput type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 font-normal" />
          </label>
          <Checkbox label="Cho đơn vị xem lại số đã gửi" checked={showPrevious} onChange={(e) => setShowPrevious(e.target.checked)} />
          <Button onClick={create} disabled={creating || !name.trim()}>
            {creating ? "Đang tạo…" : "Tạo đợt"}
          </Button>
        </div>
      </Card>

      {loading && <LoadingState />}
      {!loading && rounds.length === 0 && <EmptyState title="Chưa có đợt nào" description="Tạo đợt ở trên rồi gửi link cho các đơn vị nhập số lượng." />}

      {rounds.length > 0 && (
        <Card>
          <ul className="divide-y divide-neutral-200">
            {rounds.map((r) => {
              const st = roundState(r);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={clsx("flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-neutral-50", r.id === selectedId && "bg-brand-50")}
                  >
                    <span className="font-bold text-neutral-900">{r.name}</span>
                    <span className="flex items-center gap-3 text-xs text-neutral-600">
                      <span className="tnum">{r.deadlineDate ? `Hạn ${r.deadlineDate.split("-").reverse().join("/")}` : "Không hạn"}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {selected && <RoundPanel key={selected.id} round={selected} onChanged={() => load()} onDeleted={() => load(null)} />}
    </div>
  );
}

function RoundPanel({ round, onChanged, onDeleted }: { round: ProcurementRound; onChanged: () => void; onDeleted: () => void }) {
  const [name, setName] = useState(round.name);
  const [deadline, setDeadline] = useState(round.deadlineDate ?? "");
  const [accepting, setAccepting] = useState(round.accepting);
  const [showPrevious, setShowPrevious] = useState(round.showPrevious);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"status" | "summary">("status");

  const link = `${window.location.origin}/mua-sam/${round.id}`;
  const dirty = name !== round.name || deadline !== (round.deadlineDate ?? "") || accepting !== round.accepting || showPrevious !== round.showPrevious;

  async function save() {
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      await adminApi.procurement.updateRound(round.id, { audience: round.audience, name: name.trim(), deadlineDate: deadline || null, accepting, showPrevious });
      setMsg("Đã lưu.");
      onChanged();
    } catch (e) {
      setError(errMsg(e, "Không lưu được."));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Xóa đợt "${round.name}" cùng toàn bộ số liệu các đơn vị đã nhập? Nên xuất Excel trước.`)) return;
    try {
      await adminApi.procurement.deleteRound(round.id);
      onDeleted();
    } catch (e) {
      setError(errMsg(e, "Không xóa được."));
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-base font-extrabold text-brand-800">{round.name}</h2>
        <div className="flex gap-2">
          <a
            href={adminApi.procurement.exportUrl(round.id)}
            className="inline-flex items-center bg-brand-700 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Xuất Excel tổng hợp
          </a>
          <Button variant="danger" onClick={remove}>
            Xóa đợt
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3 border border-neutral-200 bg-neutral-50 p-3">
        <label className="min-w-[200px] flex-1 text-[13px] font-semibold text-neutral-800">
          Tên đợt
          <TextInput value={name} onChange={(e) => setName(e.target.value)} className="mt-1 font-normal" />
        </label>
        <label className="text-[13px] font-semibold text-neutral-800">
          Hạn chót
          <TextInput type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1 font-normal" />
        </label>
        <Checkbox label="Đang mở nhận đăng ký" checked={accepting} onChange={(e) => setAccepting(e.target.checked)} />
        <Checkbox label="Cho đơn vị xem lại số đã gửi" checked={showPrevious} onChange={(e) => setShowPrevious(e.target.checked)} />
        <Button onClick={save} disabled={saving || !dirty || !name.trim()}>
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </Button>
      </div>
      {msg && <p className="mb-2 text-sm text-accent-700">{msg}</p>}
      {error && <div className="mb-3"><ErrorBanner message={error} /></div>}

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-semibold text-neutral-800">Link gửi các đơn vị:</span>
        <code className="break-all bg-neutral-100 px-2 py-1 text-xs">{link}</code>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            void navigator.clipboard?.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Đã sao chép" : "Sao chép"}
        </Button>
      </div>

      <div className="mb-3">
        <Segmented
          value={view}
          options={[
            { value: "status", label: "Theo dõi đơn vị" },
            { value: "summary", label: "Bảng tổng hợp" },
          ]}
          onChange={setView}
        />
      </div>

      {view === "status" ? <StatusTable round={round} /> : <SummaryTable round={round} />}
    </Card>
  );
}

function StatusTable({ round }: { round: ProcurementRound }) {
  const [rows, setRows] = useState<ProcurementStatusRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProcurementDetail | null>(null);
  const [handoverFor, setHandoverFor] = useState<{ unitId: number; unitName: string } | null>(null);

  const load = useCallback(() => {
    adminApi.procurement
      .status(round.id)
      .then(setRows)
      .catch((e) => setError(errMsg(e, "Không tải được trạng thái.")));
  }, [round.id]);

  useEffect(() => load(), [load]);

  async function view(unitId: number) {
    try {
      setDetail(await adminApi.procurement.detail(round.id, unitId));
    } catch (e) {
      setError(errMsg(e, "Không xem được chi tiết."));
    }
  }

  async function clear(unitId: number, unitName: string) {
    if (!window.confirm(`Xóa số liệu "${unitName}" trong đợt này? Đơn vị sẽ nhập lại từ đầu.`)) return;
    try {
      await adminApi.procurement.clearSubmission(round.id, unitId);
      load();
    } catch (e) {
      setError(errMsg(e, "Không xóa được."));
    }
  }

  if (error) return <ErrorBanner message={error} />;
  if (!rows) return <LoadingState />;
  const done = rows.filter((r) => r.submitted).length;

  return (
    <div>
      <p className="mb-2 text-sm text-neutral-700">
        <span className="tnum font-bold">{done}</span>/<span className="tnum">{rows.length}</span> đơn vị đã nộp.
      </p>
      <div className="overflow-x-auto border border-neutral-300">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-300 bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-600">
              <th className="px-3 py-2">Đơn vị</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2 text-right">Số mặt hàng</th>
              <th className="px-3 py-2 text-right">Tổng SL</th>
              <th className="px-3 py-2">Cập nhật</th>
              <th className="px-3 py-2 text-right">Lần lưu</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.unitId} className="border-b border-neutral-200 last:border-0">
                <td className="px-3 py-2 font-semibold text-neutral-900">{r.unitName}</td>
                <td className="px-3 py-2">{r.submitted ? <Badge tone="accent">Đã nộp</Badge> : <Badge tone="neutral">Chưa nộp</Badge>}</td>
                <td className="tnum px-3 py-2 text-right">{r.submitted ? r.itemCount : "—"}</td>
                <td className="tnum px-3 py-2 text-right">{r.submitted ? r.totalQty : "—"}</td>
                <td className="tnum px-3 py-2 text-neutral-600">{r.updatedAt ? formatDateTime(r.updatedAt) : "—"}</td>
                <td className="tnum px-3 py-2 text-right">{r.submitted ? r.timesSaved : "—"}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right">
                  {r.submitted && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => view(r.unitId)}>
                        Xem
                      </Button>{" "}
                      <Button size="sm" variant="secondary" onClick={() => setHandoverFor({ unitId: r.unitId, unitName: r.unitName })}>
                        Biên bản bàn giao
                      </Button>{" "}
                      <Button size="sm" variant="ghost" onClick={() => clear(r.unitId, r.unitName)}>
                        Xóa số liệu
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {handoverFor && <HandoverModal round={round} unitId={handoverFor.unitId} unitName={handoverFor.unitName} onClose={() => setHandoverFor(null)} />}

      {detail && (
        <Modal title={`${detail.unit.name} — ${detail.lines.length} mặt hàng`} onClose={() => setDetail(null)}>
          <p className="mb-2 text-xs text-neutral-600">
            Cập nhật <span className="tnum">{formatDateTime(detail.updatedAt)}</span> · lưu {detail.timesSaved} lần
          </p>
          {detail.lines.length === 0 ? (
            <p className="text-sm text-neutral-600">Đơn vị ghi nhận không có nhu cầu.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {detail.lines.map((l) => (
                  <tr key={l.code} className="border-b border-neutral-100 align-top">
                    <td className="py-1.5">
                      {l.name}
                      {l.note && <div className="text-xs text-neutral-500">{l.note}</div>}
                    </td>
                    <td className="tnum whitespace-nowrap py-1.5 pl-3 text-right font-bold">
                      {l.qty} {l.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {detail.generalNote && (
            <p className="mt-3 text-sm text-neutral-800">
              <b>Đề xuất / ghi chú chung:</b> {detail.generalNote}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

const GIVER_KEY = "procurement_handover_giver";

interface HandoverLineState {
  name: string;
  unit: string;
  qty: number;
  note: string;
  include: boolean;
}

function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function HandoverModal({ round, unitId, unitName, onClose }: { round: ProcurementRound; unitId: number; unitName: string; onClose: () => void }) {
  const [detail, setDetail] = useState<ProcurementDetail | null>(null);
  const [lines, setLines] = useState<HandoverLineState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const saved = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(GIVER_KEY) ?? "{}") as { name?: string; address?: string };
    } catch {
      return {};
    }
  }, []);

  const [date, setDate] = useState(todayIso());
  const [giverName, setGiverName] = useState(saved.name ?? "");
  const [giverAddress, setGiverAddress] = useState(saved.address ?? "Phòng Quản trị cơ sở vật chất");
  const [receiverName, setReceiverName] = useState("");
  const [receiverAddress, setReceiverAddress] = useState(unitName);
  const [place, setPlace] = useState(unitName);
  const [content, setContent] = useState(`Bàn giao văn phòng phẩm ${round.name}`);

  useEffect(() => {
    adminApi.procurement
      .detail(round.id, unitId)
      .then((d) => {
        setDetail(d);
        setLines(d.lines.map((l) => ({ name: l.name, unit: l.unit, qty: l.qty, note: l.note ?? "", include: true })));
      })
      .catch((e) => setError(errMsg(e, "Không tải được danh mục đơn vị đề nghị.")));
  }, [round.id, unitId]);

  function patch(i: number, p: Partial<HandoverLineState>) {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...p } : l)));
  }

  const chosen = lines.filter((l) => l.include && l.qty > 0);

  async function download() {
    if (!detail) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await adminApi.procurement.handover(round.id, unitId, {
        date: date || null,
        giverName,
        giverAddress,
        receiverName,
        receiverAddress,
        place,
        content,
        lines: chosen.map((l) => ({ name: l.name, unit: l.unit, qty: l.qty, note: l.note })),
      });
      try {
        localStorage.setItem(GIVER_KEY, JSON.stringify({ name: giverName, address: giverAddress }));
      } catch {
        // bo qua neu khong luu duoc
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bien-ban-ban-giao-${detail.unit.code}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(errMsg(e, "Không xuất được biên bản."));
    } finally {
      setBusy(false);
    }
  }

  const field = (label: string, value: string, set: (v: string) => void, extra?: string) => (
    <label className={clsx("block text-[13px] font-semibold text-neutral-800", extra)}>
      {label}
      <TextInput value={value} onChange={(e) => set(e.target.value)} className="mt-1 font-normal" />
    </label>
  );

  return (
    <Modal title={`Biên bản bàn giao — ${unitName}`} onClose={onClose} wide>
      {error && <div className="mb-3"><ErrorBanner message={error} /></div>}
      {!detail && !error && <LoadingState />}
      {detail && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-600">Danh mục điền sẵn từ số lượng đơn vị đã đề nghị. Bạn chỉnh số lượng thực giao, bỏ tick món không giao, rồi xuất Excel đúng mẫu biên bản.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[13px] font-semibold text-neutral-800">
              Ngày lập biên bản
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 font-normal" />
            </label>
            {field("Nội dung", content, setContent)}
            {field("Họ tên người giao", giverName, setGiverName)}
            {field("Địa chỉ bên giao", giverAddress, setGiverAddress)}
            {field("Họ tên người nhận", receiverName, setReceiverName)}
            {field("Địa chỉ bên nhận", receiverAddress, setReceiverAddress)}
            {field("Địa điểm giao nhận", place, setPlace, "sm:col-span-2")}
          </div>

          <div className="overflow-x-auto border border-neutral-300">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-300 bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-600">
                  <th className="px-2 py-2">Giao</th>
                  <th className="px-2 py-2">Tên hàng</th>
                  <th className="px-2 py-2">ĐVT</th>
                  <th className="px-2 py-2 text-right">Số lượng</th>
                  <th className="px-2 py-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((l, i) => (
                  <tr key={i} className={clsx("border-b border-neutral-200 last:border-0", !l.include && "text-neutral-400")}>
                    <td className="px-2 py-1.5">
                      <input type="checkbox" checked={l.include} onChange={(e) => patch(i, { include: e.target.checked })} aria-label={`Giao ${l.name}`} />
                    </td>
                    <td className="px-2 py-1.5 font-semibold">{l.name}</td>
                    <td className="px-2 py-1.5">{l.unit}</td>
                    <td className="px-2 py-1.5 text-right">
                      <TextInput type="number" min={0} className="tnum w-24 text-right" value={l.qty} onChange={(e) => patch(i, { qty: Math.max(0, Math.floor(Number(e.target.value) || 0)) })} />
                    </td>
                    <td className="px-2 py-1.5">
                      <TextInput value={l.note} onChange={(e) => patch(i, { note: e.target.value })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detail.generalNote && (
            <p className="text-xs text-neutral-600">
              <b>Đơn vị còn đề xuất ngoài danh mục:</b> {detail.generalNote}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-neutral-700">
              <b className="tnum">{chosen.length}</b> mặt hàng sẽ ghi vào biên bản
            </span>
            <Button onClick={download} disabled={busy || chosen.length === 0}>
              {busy ? "Đang tạo…" : "Xuất biên bản Excel"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function SummaryTable({ round }: { round: ProcurementRound }) {
  const [data, setData] = useState<ProcurementSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [onlyFilled, setOnlyFilled] = useState(true);

  useEffect(() => {
    adminApi.procurement
      .summary(round.id)
      .then(setData)
      .catch((e) => setError(errMsg(e, "Không tải được bảng tổng hợp.")));
  }, [round.id]);

  const rows = useMemo(() => (data ? data.rows.filter((r) => !onlyFilled || r.total > 0) : []), [data, onlyFilled]);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <LoadingState />;

  return (
    <div>
      <div className="mb-2">
        <Checkbox label="Chỉ hiện mặt hàng có số lượng" checked={onlyFilled} onChange={(e) => setOnlyFilled(e.target.checked)} />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Chưa có số liệu" description="Chưa đơn vị nào nhập số lượng trong đợt này." />
      ) : (
        <div className="max-h-[70vh] overflow-auto border border-neutral-300">
          <table className="w-full min-w-max text-sm">
            <thead className="sticky top-0 bg-neutral-100">
              <tr className="border-b border-neutral-300 text-left text-xs uppercase tracking-wide text-neutral-600">
                <th className="px-3 py-2">Tên hàng</th>
                <th className="px-3 py-2">ĐVT</th>
                {data.units.map((u) => (
                  <th key={u.id} className="px-3 py-2 text-right">
                    {u.name}
                  </th>
                ))}
                <th className="px-3 py-2 text-right">Tổng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code} className="border-b border-neutral-200 last:border-0">
                  <td className="px-3 py-1.5">
                    <span className="font-semibold text-neutral-900">{r.name}</span>
                    <span className="ml-2 text-xs text-neutral-500">{r.code}</span>
                  </td>
                  <td className="px-3 py-1.5 text-neutral-600">{r.unit}</td>
                  {data.units.map((u) => (
                    <td key={u.id} className="tnum px-3 py-1.5 text-right">
                      {r.qtyByUnit[String(u.id)] ?? ""}
                    </td>
                  ))}
                  <td className="tnum px-3 py-1.5 text-right font-extrabold">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Danh mục ---- */

function ItemsTab({ audience }: { audience: ProcurementAudience }) {
  const [items, setItems] = useState<ProcurementItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ code: "", groupName: "", name: "", unitLabel: "", visible: true });
  const [add, setAdd] = useState({ code: "", groupName: "", name: "", unitLabel: "" });

  const load = useCallback(() => {
    adminApi.procurement
      .items(audience)
      .then(setItems)
      .catch((e) => setError(errMsg(e, "Không tải được danh mục.")))
      .finally(() => setLoading(false));
  }, [audience]);

  useEffect(() => load(), [load]);

  const groups = useMemo(() => [...new Set(items.map((i) => i.groupName))], [items]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? items.filter((i) => `${i.code} ${i.name} ${i.groupName}`.toLowerCase().includes(q)) : items;
  }, [items, search]);

  async function run(fn: () => Promise<unknown>, fallback: string) {
    setError(null);
    try {
      await fn();
      load();
      return true;
    } catch (e) {
      setError(errMsg(e, fallback));
      return false;
    }
  }

  async function addItem() {
    const ok = await run(() => adminApi.procurement.createItem({ audience, ...add }), "Không thêm được mặt hàng.");
    if (ok) setAdd({ code: "", groupName: add.groupName, name: "", unitLabel: "" });
  }

  function startEdit(i: ProcurementItemRow) {
    setEditId(i.id);
    setDraft({ code: i.code, groupName: i.groupName, name: i.name, unitLabel: i.unitLabel, visible: i.visible });
  }

  async function saveEdit(id: number) {
    const ok = await run(() => adminApi.procurement.updateItem(id, draft), "Không lưu được mặt hàng.");
    if (ok) setEditId(null);
  }

  return (
    <div className="space-y-5">
      <ImportItems audience={audience} onDone={load} />

      {error && <ErrorBanner message={error} />}

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-extrabold text-neutral-900">Thêm mặt hàng</h2>
        <div className="grid gap-2 sm:grid-cols-[110px_180px_1fr_90px_auto]">
          <TextInput placeholder="Mã hàng" value={add.code} onChange={(e) => setAdd({ ...add, code: e.target.value })} />
          <TextInput placeholder="Nhóm" list="proc-groups" value={add.groupName} onChange={(e) => setAdd({ ...add, groupName: e.target.value })} />
          <TextInput placeholder="Tên hàng" value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} />
          <TextInput placeholder="ĐVT" value={add.unitLabel} onChange={(e) => setAdd({ ...add, unitLabel: e.target.value })} />
          <Button onClick={addItem} disabled={!add.code.trim() || !add.name.trim()}>
            Thêm
          </Button>
        </div>
        <datalist id="proc-groups">
          {groups.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <TextInput placeholder="Tìm theo mã, tên, nhóm…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        <Badge tone="brand">{items.length} mặt hàng</Badge>
      </div>

      {loading && <LoadingState />}
      {!loading && items.length === 0 && <EmptyState title="Chưa có mặt hàng nào" description="Thêm từng món ở trên hoặc nhập cả danh mục từ Excel." />}

      {filtered.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-300 bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-600">
                  <th className="px-3 py-2">Mã</th>
                  <th className="px-3 py-2">Nhóm</th>
                  <th className="px-3 py-2">Tên hàng</th>
                  <th className="px-3 py-2">ĐVT</th>
                  <th className="px-3 py-2">Hiển thị</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) =>
                  editId === i.id ? (
                    <tr key={i.id} className="border-b border-neutral-200 bg-brand-50/40">
                      <td className="px-2 py-1.5"><TextInput value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></td>
                      <td className="px-2 py-1.5"><TextInput list="proc-groups" value={draft.groupName} onChange={(e) => setDraft({ ...draft, groupName: e.target.value })} /></td>
                      <td className="px-2 py-1.5"><TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></td>
                      <td className="px-2 py-1.5"><TextInput className="w-24" value={draft.unitLabel} onChange={(e) => setDraft({ ...draft, unitLabel: e.target.value })} /></td>
                      <td className="px-2 py-1.5"><Checkbox label="" checked={draft.visible} onChange={(e) => setDraft({ ...draft, visible: e.target.checked })} /></td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-right">
                        <Button size="sm" onClick={() => saveEdit(i.id)}>Lưu</Button>{" "}
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Hủy</Button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={i.id} className={clsx("border-b border-neutral-200 last:border-0", !i.visible && "text-neutral-400")}>
                      <td className="tnum px-3 py-1.5 font-mono text-xs">{i.code}</td>
                      <td className="px-3 py-1.5">{i.groupName}</td>
                      <td className="px-3 py-1.5 font-semibold">{i.name}</td>
                      <td className="px-3 py-1.5">{i.unitLabel}</td>
                      <td className="px-3 py-1.5">{i.visible ? "Có" : "Ẩn"}</td>
                      <td className="whitespace-nowrap px-3 py-1.5 text-right">
                        <Button size="sm" variant="secondary" onClick={() => startEdit(i)}>Sửa</Button>{" "}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.confirm(`Xóa "${i.name}" khỏi danh mục? Số liệu cũ vẫn được giữ trong các đợt đã nhập.`) && void run(() => adminApi.procurement.deleteItem(i.id), "Không xóa được.")}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function ImportItems({ audience, onDone }: { audience: ProcurementAudience; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ProcurementImportPreview | null>(null);
  const [busy, setBusy] = useState<"preview" | "commit" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function run(commit: boolean) {
    if (!file) return;
    setBusy(commit ? "commit" : "preview");
    setError(null);
    setDone(null);
    try {
      const res = await adminApi.procurement.importItems(audience, file, commit);
      if (commit) {
        setDone(`Đã thêm ${res.addedCount} mặt hàng mới, cập nhật ${res.updatedCount} mặt hàng đã có.`);
        setFile(null);
        setPreview(null);
        if (ref.current) ref.current.value = "";
        onDone();
      } else {
        setPreview(res);
      }
    } catch (e) {
      setError(errMsg(e, "Đọc file thất bại."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-neutral-900">Nhập danh mục từ Excel</h2>
        <a href={adminApi.procurement.itemTemplateUrl} className="border border-neutral-300 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-800 hover:border-neutral-500 hover:bg-neutral-50">
          Tải file mẫu
        </a>
      </div>
      <p className="mb-3 text-xs text-neutral-600">
        Các cột: Mã hàng, Nhóm, Tên hàng, ĐVT, Hiển thị (Có/Không). Chỉ <strong>Tên hàng</strong> là bắt buộc; để trống <strong>Mã hàng</strong> thì hệ thống tự tăng mã. Dòng có tên đã tồn tại thì cập nhật, tên mới thì thêm xuống cuối; không xóa mặt hàng nào.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={ref}
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setPreview(null);
            setDone(null);
            setError(null);
          }}
          className="text-sm text-neutral-600 file:mr-3 file:border file:border-neutral-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-neutral-700 hover:file:bg-neutral-50"
        />
        <Button size="sm" variant="secondary" disabled={!file || busy !== null} onClick={() => run(false)}>
          {busy === "preview" ? "Đang đọc…" : "Xem trước"}
        </Button>
        {preview && preview.validCount > 0 && preview.errors.length === 0 && (
          <Button size="sm" disabled={busy !== null} onClick={() => run(true)}>
            {busy === "commit" ? "Đang nhập…" : `Xác nhận nhập ${preview.validCount} dòng`}
          </Button>
        )}
      </div>
      {preview && (
        <div className="mt-3 border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm">
          <p className="text-neutral-800">
            {preview.validCount} dòng hợp lệ: {preview.newCount} thêm mới, {preview.updateCount} cập nhật.
          </p>
          {preview.errors.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs text-urgent-600">
              {preview.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-urgent-600">{error}</p>}
      {done && <p className="mt-2 text-sm text-accent-700">{done}</p>}
    </Card>
  );
}

/* ------------------------------------------------------------- Đơn vị ---- */

function UnitsTab({ audience }: { audience: ProcurementAudience }) {
  const [units, setUnits] = useState<ProcurementUnitRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [draft, setDraft] = useState({ code: "", name: "", active: true });
  const [add, setAdd] = useState({ code: "", name: "" });

  const load = useCallback(() => {
    adminApi.procurement
      .units(audience)
      .then(setUnits)
      .catch((e) => setError(errMsg(e, "Không tải được danh sách đơn vị.")))
      .finally(() => setLoading(false));
  }, [audience]);

  useEffect(() => load(), [load]);

  async function run(fn: () => Promise<unknown>, fallback: string) {
    setError(null);
    try {
      await fn();
      load();
      return true;
    } catch (e) {
      setError(errMsg(e, fallback));
      return false;
    }
  }

  async function addUnit() {
    const ok = await run(() => adminApi.procurement.createUnit({ audience, ...add }), "Không thêm được đơn vị.");
    if (ok) setAdd({ code: "", name: "" });
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}
      <Card className="p-4">
        <h2 className="mb-1 text-sm font-extrabold text-neutral-900">Thêm đơn vị</h2>
        <p className="mb-2 text-xs text-neutral-600">Đơn vị hiện trong ô chọn ở trang đăng ký, và là một cột trong bảng tổng hợp. Mã đơn vị nên đặt ngắn gọn và không đổi sau khi đã có số liệu.</p>
        <div className="grid gap-2 sm:grid-cols-[140px_1fr_auto]">
          <TextInput placeholder="Mã (vd: DAOTAO)" value={add.code} onChange={(e) => setAdd({ ...add, code: e.target.value })} />
          <TextInput placeholder="Tên hiển thị (vd: Đào tạo)" value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} />
          <Button onClick={addUnit} disabled={!add.code.trim() || !add.name.trim()}>
            Thêm
          </Button>
        </div>
      </Card>

      {loading && <LoadingState />}
      {!loading && units.length === 0 && <EmptyState title="Chưa có đơn vị nào" description="Thêm các đơn vị sẽ được nhập số lượng." />}

      {units.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-600">
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Tên đơn vị</th>
                <th className="px-3 py-2">Hiển thị</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {units.map((u) =>
                editId === u.id ? (
                  <tr key={u.id} className="border-b border-neutral-200 bg-brand-50/40">
                    <td className="px-2 py-1.5"><TextInput value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} /></td>
                    <td className="px-2 py-1.5"><TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></td>
                    <td className="px-2 py-1.5"><Checkbox label="" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /></td>
                    <td className="whitespace-nowrap px-2 py-1.5 text-right">
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (await run(() => adminApi.procurement.updateUnit(u.id, draft), "Không lưu được đơn vị.")) setEditId(null);
                        }}
                      >
                        Lưu
                      </Button>{" "}
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Hủy</Button>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className={clsx("border-b border-neutral-200 last:border-0", !u.active && "text-neutral-400")}>
                    <td className="px-3 py-1.5 font-mono text-xs">{u.code}</td>
                    <td className="px-3 py-1.5 font-semibold">{u.name}</td>
                    <td className="px-3 py-1.5">{u.active ? "Có" : "Ẩn"}</td>
                    <td className="whitespace-nowrap px-3 py-1.5 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditId(u.id);
                          setDraft({ code: u.code, name: u.name, active: u.active });
                        }}
                      >
                        Sửa
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.confirm(`Xóa đơn vị "${u.name}"?`) && void run(() => adminApi.procurement.deleteUnit(u.id), "Không xóa được.")}
                      >
                        Xóa
                      </Button>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
