import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { ProcurementAudience, ProcurementCatalogItem, ProcurementForm, ProcurementRound, ProcurementUnitRef } from "../lib/types";
import { formatDateTime } from "../lib/format";
import { PageHero } from "../components/PageHero";
import { LoadingState, ErrorState } from "../components/states";

const MAX_QTY = 9999;

const AUDIENCE_LABEL: Record<ProcurementAudience, string> = {
  PHONG: "Các phòng, ban",
  KHOA: "Các khoa",
};

const input =
  "block w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase();

function viDate(d: string | null) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function deadlineText(round: ProcurementRound) {
  const d = viDate(round.deadlineDate);
  return d ? `Hạn chót ${d}` : "Không giới hạn thời gian";
}

export function ProcurementListPage() {
  const [rounds, setRounds] = useState<ProcurementRound[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .procurementRounds()
      .then((r) => setRounds(r.rounds))
      .catch(() => setError(true));
  }, []);

  return (
    <div>
      <PageHero
        title="Đăng ký mua sắm văn phòng phẩm"
        description="Các đơn vị chọn đợt đang mở, chọn tên đơn vị rồi nhập số lượng cần mua."
        breadcrumb={[{ label: "Mua sắm" }]}
      />
      <div className="mx-auto max-w-2xl px-4 py-8">
        {error && <ErrorState message="Không tải được danh sách đợt đăng ký." />}
        {!error && rounds === null && <LoadingState />}
        {rounds && rounds.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
            <p className="font-semibold text-neutral-800">Hiện chưa có đợt đăng ký nào đang mở.</p>
            <p className="mt-1 text-sm text-neutral-500">Khi Phòng Quản trị Cơ sở vật chất mở đợt mới, đợt đó sẽ xuất hiện ở đây.</p>
          </div>
        )}
        {rounds && rounds.length > 0 && (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {rounds.map((r) => (
              <li key={r.id}>
                <Link to={`/mua-sam/${r.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50">
                  <span className="min-w-0">
                    <span className="block text-base font-extrabold text-brand-800">{r.name}</span>
                    <span className="mt-0.5 block text-sm text-neutral-600">
                      {AUDIENCE_LABEL[r.audience]} · <span className="tnum">{deadlineText(r)}</span>
                    </span>
                  </span>
                  <span className="flex-shrink-0 text-sm font-semibold text-brand-700">Nhập số lượng →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface LineState {
  qty: number;
  note: string;
}

export function ProcurementRoundPage() {
  const params = useParams();
  const roundId = Number(params.roundId);
  const storeKey = `procurement_unit_${roundId}`;

  const [round, setRound] = useState<ProcurementRound | null>(null);
  const [units, setUnits] = useState<ProcurementUnitRef[]>([]);
  const [state, setState] = useState<"loading" | "missing" | "pick" | "form">("loading");
  const [unitId, setUnitId] = useState("");
  const [pickError, setPickError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<ProcurementForm | null>(null);

  async function openForm(id: number) {
    const f = await api.procurementForm(roundId, id);
    setForm(f);
    setRound(f.round);
    setState("form");
  }

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    api
      .procurementRound(roundId)
      .then(async (res) => {
        if (cancelled) return;
        setRound(res.round);
        setUnits(res.units);
        let saved: string | null = null;
        try {
          saved = sessionStorage.getItem(storeKey);
        } catch {
          saved = null;
        }
        if (saved && res.units.some((u) => String(u.id) === saved)) {
          try {
            await openForm(Number(saved));
            return;
          } catch {
            // don vi da luu khong con hop le, quay ve buoc chon
          }
        }
        if (!cancelled) setState("pick");
      })
      .catch(() => !cancelled && setState("missing"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId]);

  async function onPick(e: FormEvent) {
    e.preventDefault();
    if (!unitId) {
      setPickError("Vui lòng chọn đơn vị.");
      return;
    }
    setBusy(true);
    setPickError(null);
    try {
      await openForm(Number(unitId));
      try {
        sessionStorage.setItem(storeKey, unitId);
      } catch {
        // bo qua neu trinh duyet chan sessionStorage
      }
    } catch (err) {
      setPickError(err instanceof ApiError ? err.message : "Không mở được form đăng ký.");
    } finally {
      setBusy(false);
    }
  }

  function changeUnit() {
    try {
      sessionStorage.removeItem(storeKey);
    } catch {
      // bo qua
    }
    setForm(null);
    setUnitId("");
    setState("pick");
  }

  if (state === "loading") return <LoadingState />;
  if (state === "missing" || !round) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-800">Không tìm thấy đợt đăng ký này.</p>
        <Link to="/mua-sam" className="mt-3 inline-block text-brand-700 hover:underline">
          Xem các đợt đang mở
        </Link>
      </div>
    );
  }

  const crumbs = [{ label: "Mua sắm", to: "/mua-sam" }, { label: round.name }];

  if (state === "pick" || !form) {
    return (
      <div>
        <PageHero title="Đăng ký mua sắm văn phòng phẩm" description={`${round.name} · ${deadlineText(round)}`} breadcrumb={crumbs} />
        <div className="mx-auto max-w-md px-4 py-8">
          <form onSubmit={onPick} className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
            <label htmlFor="unit" className="block text-sm font-semibold text-neutral-800">
              Đơn vị
            </label>
            <select id="unit" value={unitId} onChange={(e) => setUnitId(e.target.value)} className={input}>
              <option value="">Chọn đơn vị của bạn</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            {!round.open && <p className="text-sm text-urgent-600">Đợt đăng ký đã khóa.</p>}
            {pickError && <p role="alert" className="text-sm text-urgent-600">{pickError}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-50">
              {busy ? "Đang mở…" : "Bắt đầu nhập"}
            </button>
            <p className="text-xs text-neutral-500">
              {round.showPrevious
                ? "Nếu đơn vị đã gửi trước đó, số lượng cũ sẽ hiện lại để bạn sửa."
                : "Vì lý do bảo mật, form luôn mở trống. Nếu lưu lại, bản mới sẽ thay toàn bộ bản đã gửi trước đó."}
            </p>
          </form>
        </div>
      </div>
    );
  }

  return <OrderForm key={`${form.round.id}-${form.unit.id}`} form={form} crumbs={crumbs} onChangeUnit={changeUnit} />;
}

function OrderForm({
  form,
  crumbs,
  onChangeUnit,
}: {
  form: ProcurementForm;
  crumbs: { label: string; to?: string }[];
  onChangeUnit: () => void;
}) {
  const open = form.round.open;
  const [vals, setVals] = useState<Record<string, LineState>>(() => {
    const init: Record<string, LineState> = {};
    for (const [code, v] of Object.entries(form.values)) init[code] = { qty: v.qty, note: v.note };
    return init;
  });
  const [general, setGeneral] = useState(form.generalNote);
  const [query, setQuery] = useState("");
  const [onlyHas, setOnlyHas] = useState(false);
  const [noteOpen, setNoteOpen] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(form.updatedAt);
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; bad: boolean } | null>(null);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const groups = useMemo(() => {
    const out: { name: string; items: ProcurementCatalogItem[] }[] = [];
    for (const c of form.catalog) {
      let g = out.find((x) => x.name === c.group);
      if (!g) out.push((g = { name: c.group, items: [] }));
      g.items.push(c);
    }
    return out;
  }, [form.catalog]);

  const q = norm(query.trim());
  const qtyOf = (code: string) => vals[code]?.qty ?? 0;
  const filled = form.catalog.filter((c) => qtyOf(c.code) > 0);

  function setQty(code: string, raw: number) {
    const qty = Math.max(0, Math.min(MAX_QTY, Math.floor(Number(raw) || 0)));
    setVals((prev) => ({ ...prev, [code]: { qty, note: prev[code]?.note ?? "" } }));
    setDirty(true);
  }

  function setNote(code: string, note: string) {
    setVals((prev) => ({ ...prev, [code]: { qty: prev[code]?.qty ?? 0, note } }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const items = filled.map((c) => ({ code: c.code, qty: qtyOf(c.code), note: vals[c.code]?.note ?? "" }));
      const res = await api.saveProcurement(form.round.id, form.unit.id, items, general);
      setReviewing(false);
      setDirty(false);
      setLastSaved(res.savedAt);
      setToast({ text: `Đã lưu ${res.count} mặt hàng`, bad: false });
    } catch (err) {
      setToast({ text: err instanceof ApiError ? err.message : "Lưu thất bại, vui lòng thử lại.", bad: true });
    } finally {
      setSaving(false);
    }
  }

  function changeUnit() {
    if (dirty && !window.confirm("Có thay đổi chưa lưu. Vẫn đổi đơn vị?")) return;
    setDirty(false);
    onChangeUnit();
  }

  const blind = !form.round.showPrevious && form.updatedAt && open;
  let shown = 0;

  return (
    <div className="pb-24">
      <PageHero
        title={form.unit.name}
        description={`${form.round.name} · ${deadlineText(form.round)}`}
        breadcrumb={crumbs}
        actions={
          <button type="button" onClick={changeUnit} className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50">
            Đổi đơn vị
          </button>
        }
      />

      <div className="mx-auto max-w-3xl px-4">
        {!open && (
          <p className="mt-4 rounded-md border border-urgent-500/40 bg-urgent-50 px-4 py-2.5 text-sm text-urgent-600">
            {form.round.showPrevious ? "Đợt đăng ký đã khóa. Bạn chỉ xem được số lượng đã gửi." : "Đợt đăng ký đã khóa."}
          </p>
        )}
        {blind && (
          <p className="mt-4 rounded-md border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
            Đơn vị đã gửi lúc <span className="tnum">{formatDateTime(form.updatedAt!)}</span>. Nếu lưu lần nữa, bản mới sẽ thay toàn bộ bản cũ, nên hãy nhập đủ tất cả mặt hàng.
          </p>
        )}

        <div className="sticky top-0 z-10 -mx-4 mt-4 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm mặt hàng, ví dụ: kẹp bướm, giấy A4"
            className={input}
          />
          <div className="mt-2 flex items-center gap-3">
            <div className="flex flex-1 gap-1.5 overflow-x-auto pb-0.5">
              {groups.map((g, i) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => document.getElementById(`pg-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  className="flex-shrink-0 whitespace-nowrap rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold text-neutral-700 hover:border-brand-700 hover:text-brand-700"
                >
                  {g.name}
                </button>
              ))}
            </div>
            <label className="flex flex-shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-neutral-600">
              <input type="checkbox" checked={onlyHas} onChange={(e) => setOnlyHas(e.target.checked)} />
              Chỉ món đã nhập
            </label>
          </div>
        </div>

        <div className="mt-2">
          {groups.map((g, i) => {
            const items = g.items.filter((c) => (!q || norm(`${c.name} ${c.group}`).includes(q)) && (!onlyHas || qtyOf(c.code) > 0));
            shown += items.length;
            if (items.length === 0) return null;
            const has = g.items.filter((c) => qtyOf(c.code) > 0).length;
            return (
              <section key={g.name} id={`pg-${i}`} className="mt-6 scroll-mt-32">
                <h2 className="mb-2 flex items-baseline justify-between text-sm font-extrabold text-brand-800">
                  {g.name}
                  {has > 0 && <small className="tnum font-semibold text-neutral-500">{has} món đã nhập</small>}
                </h2>
                <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
                  {items.map((c) => {
                    const v = vals[c.code];
                    const hasQty = (v?.qty ?? 0) > 0;
                    const showNote = noteOpen[c.code] || !!v?.note;
                    return (
                      <li key={c.code} className={`grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-2.5 ${hasQty ? "bg-brand-50/50" : ""}`}>
                        <div className="min-w-0">
                          <span className={`text-sm ${hasQty ? "font-bold text-neutral-900" : "text-neutral-800"}`}>{c.name}</span>
                          {c.unit && <span className="ml-2 rounded border border-neutral-300 px-1.5 text-xs text-neutral-500">{c.unit}</span>}
                          {open && (
                            <button type="button" onClick={() => setNoteOpen((p) => ({ ...p, [c.code]: true }))} className="ml-2 text-xs font-semibold text-brand-700 hover:underline">
                              {v?.note ? "Sửa ghi chú" : "Ghi chú"}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center overflow-hidden rounded-md border border-neutral-300 bg-white">
                          <button type="button" disabled={!open} aria-label={`Giảm ${c.name}`} onClick={() => setQty(c.code, qtyOf(c.code) - 1)} className="h-9 w-9 text-lg text-brand-700 hover:bg-brand-50 disabled:opacity-40">
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={MAX_QTY}
                            inputMode="numeric"
                            disabled={!open}
                            value={hasQty ? v!.qty : ""}
                            placeholder="0"
                            aria-label={`Số lượng ${c.name}`}
                            onChange={(e) => setQty(c.code, Number(e.target.value))}
                            className="tnum h-9 w-16 border-x border-neutral-300 text-center text-sm font-bold [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                          <button type="button" disabled={!open} aria-label={`Tăng ${c.name}`} onClick={() => setQty(c.code, qtyOf(c.code) + 1)} className="h-9 w-9 text-lg text-brand-700 hover:bg-brand-50 disabled:opacity-40">
                            +
                          </button>
                        </div>
                        {showNote && (
                          <input
                            type="text"
                            maxLength={200}
                            disabled={!open}
                            value={v?.note ?? ""}
                            onChange={(e) => setNote(c.code, e.target.value)}
                            placeholder="Ghi chú cho mặt hàng này"
                            className="col-span-2 rounded-md border border-dashed border-neutral-300 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {shown === 0 && (
            <p className="py-10 text-center text-sm text-neutral-500">Không có mặt hàng nào khớp. Thử từ khóa khác hoặc ghi vào ô đề xuất bên dưới.</p>
          )}

          <section className="mt-6">
            <h2 className="mb-2 text-sm font-extrabold text-brand-800">Đề xuất mặt hàng ngoài danh mục, ghi chú chung</h2>
            <textarea
              rows={4}
              maxLength={1000}
              disabled={!open}
              value={general}
              onChange={(e) => {
                setGeneral(e.target.value);
                setDirty(true);
              }}
              placeholder="Ví dụ: Bìa trình ký da A4, 5 cái"
              className={input}
            />
          </section>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-300 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
            <div className="text-sm">
              <b className="tnum text-lg">{filled.length}</b> mặt hàng có số lượng
              <span className={`block text-xs ${dirty ? "text-amber-700" : "text-neutral-500"}`}>
                {dirty ? "Có thay đổi chưa lưu" : lastSaved ? `Đã gửi lúc ${formatDateTime(lastSaved)}` : "Chưa gửi lần nào"}
              </span>
            </div>
            <button type="button" onClick={() => setReviewing(true)} className="rounded-md bg-brand-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800">
              Lưu đăng ký
            </button>
          </div>
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Kiểm tra trước khi lưu">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-lg bg-white">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h3 className="text-lg font-extrabold text-neutral-900">Kiểm tra trước khi lưu</h3>
              <p className="text-sm text-neutral-600">
                {form.unit.name}: <span className="tnum">{filled.length}</span> mặt hàng
              </p>
            </div>
            <div className="overflow-y-auto px-5 py-3">
              {filled.length === 0 && !general.trim() ? (
                <p className="py-6 text-center text-sm text-neutral-600">Chưa nhập mặt hàng nào. Lưu lúc này sẽ ghi nhận đơn vị không có nhu cầu.</p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <tbody>
                      {filled.map((c) => (
                        <tr key={c.code} className="border-b border-neutral-100 align-top">
                          <td className="py-1.5">
                            {c.name}
                            {vals[c.code]?.note && <div className="text-xs text-neutral-500">{vals[c.code].note}</div>}
                          </td>
                          <td className="tnum whitespace-nowrap py-1.5 pl-3 text-right font-bold">
                            {qtyOf(c.code)} {c.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {general.trim() && (
                    <p className="mt-3 text-sm text-neutral-700">
                      <b>Đề xuất / ghi chú chung:</b> {general.trim()}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3">
              <button type="button" onClick={() => setReviewing(false)} disabled={saving} className="rounded-md px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
                Sửa tiếp
              </button>
              <button type="button" onClick={save} disabled={saving} className="rounded-md bg-brand-700 px-5 py-2 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-50">
                {saving ? "Đang lưu…" : "Lưu đăng ký"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div role="status" aria-live="polite" className={`fixed bottom-20 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-md px-4 py-2.5 text-sm font-semibold text-white ${toast.bad ? "bg-urgent-600" : "bg-neutral-900"}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
