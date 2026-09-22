import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { PublicTool, ToolColumn, ToolField } from "../lib/types";
import { formatDateTime } from "../lib/format";
import { PageHero } from "../components/PageHero";
import { LoadingState } from "../components/states";

const input =
  "block w-full rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600";

const STATUS_META = {
  MOI: { label: "Đang chờ xử lý", className: "bg-amber-50 text-amber-800 border-amber-200" },
  DA_XU_LY: { label: "Đã xử lý", className: "bg-accent-50 text-accent-800 border-accent-200" },
  TU_CHOI: { label: "Từ chối", className: "bg-urgent-50 text-urgent-600 border-urgent-500/30" },
} as const;

function FormTool({ tool }: { tool: PublicTool }) {
  const fields = (tool.config.fields as ToolField[] | undefined) ?? [];
  const trackable = tool.config.trackable !== false;
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ code: string; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.submitTool(tool.slug, values, files, website);
      setDone({ code: res.code, message: res.message });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gửi thất bại, vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-accent-200 bg-accent-50 p-6">
        <p className="text-base font-bold text-accent-800">{done.message}</p>
        {trackable && (
          <div className="mt-4">
            <p className="text-sm text-neutral-700">Mã hồ sơ của bạn (dùng để tra cứu tình trạng):</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-neutral-300 bg-white px-4 py-2 font-mono text-lg font-bold tracking-wider text-neutral-900">{done.code}</span>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(done.code);
                  setCopied(true);
                }}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                {copied ? "Đã sao chép" : "Sao chép"}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => {
            setDone(null);
            setValues({});
            setFiles({});
          }}
          className="mt-4 text-sm font-semibold text-brand-700 hover:underline"
        >
          Gửi thêm một hồ sơ khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
      {fields.length === 0 && <p className="text-sm text-neutral-500">Chức năng này chưa có trường nhập nào.</p>}
      {fields.map((f) => (
        <div key={f.key}>
          {f.type === "CHECKBOX" ? (
            <label className="flex items-start gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4"
                checked={values[f.key] === "true"}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.checked ? "true" : "false" })}
              />
              <span>
                {f.label}
                {f.required && <span className="text-urgent-600"> *</span>}
              </span>
            </label>
          ) : (
            <>
              <label className="mb-1 block text-sm font-semibold text-neutral-800">
                {f.label}
                {f.required && <span className="text-urgent-600"> *</span>}
              </label>
              {f.type === "TEXTAREA" ? (
                <textarea rows={4} required={f.required} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className={input} />
              ) : f.type === "SELECT" ? (
                <select required={f.required} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} className={input}>
                  <option value="">— Chọn —</option>
                  {f.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : f.type === "FILE" ? (
                <input
                  type="file"
                  required={f.required}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFiles((prev) => {
                      const next = { ...prev };
                      if (file) next[f.key] = file;
                      else delete next[f.key];
                      return next;
                    });
                  }}
                  className="block w-full text-sm text-neutral-700 file:mr-3 file:rounded-md file:border file:border-neutral-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-semibold"
                />
              ) : (
                <input
                  type={f.type === "EMAIL" ? "email" : f.type === "DATE" ? "date" : f.type === "NUMBER" ? "text" : f.type === "PHONE" ? "tel" : "text"}
                  inputMode={f.type === "NUMBER" ? "decimal" : undefined}
                  required={f.required}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  className={input}
                />
              )}
            </>
          )}
          {f.hint && <p className="mt-1 text-xs text-neutral-500">{f.hint}</p>}
        </div>
      ))}
      <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(e) => setWebsite(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" />
      {error && <p role="alert" className="rounded-md border border-urgent-500/40 bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</p>}
      {fields.length > 0 && (
        <button type="submit" disabled={busy} className="w-full rounded-md bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-50">
          {busy ? "Đang gửi…" : (tool.config.submitLabel as string) || "Gửi thông tin"}
        </button>
      )}
    </form>
  );
}

function StatusBox({ tool }: { tool: PublicTool }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<Awaited<ReturnType<typeof api.toolStatus>> | null>(null);

  async function check(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setRes(null);
    try {
      setRes(await api.toolStatus(tool.slug, code));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tra cứu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-5">
      <h2 className="text-base font-extrabold text-brand-800">Tra cứu tình trạng hồ sơ</h2>
      <form onSubmit={check} className="mt-3 flex gap-2">
        <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nhập mã hồ sơ, ví dụ YC-XXXXXXXX" className={`${input} font-mono`} />
        <button type="submit" disabled={busy || !code.trim()} className="flex-shrink-0 rounded-md bg-brand-700 px-4 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-50">
          {busy ? "…" : "Tra cứu"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-urgent-600">{error}</p>}
      {res && (
        <div className="mt-3 rounded-md border border-neutral-200 p-4">
          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${STATUS_META[res.status].className}`}>{STATUS_META[res.status].label}</span>
          <p className="mt-2 text-xs text-neutral-500">Gửi lúc {formatDateTime(res.createdAt)}</p>
          {res.resultMessage && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{res.resultMessage}</p>}
        </div>
      )}
    </section>
  );
}

function LookupTool({ tool }: { tool: PublicTool }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<{ label: string; value: string }[] | null>(null);
  const columns = (tool.config.columns as ToolColumn[] | undefined) ?? [];

  async function search(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields(null);
    try {
      setFields(await api.toolLookup(tool.slug, q));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tra cứu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={search} className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5">
        <label className="block text-sm font-semibold text-neutral-800">{(tool.config.keyLabel as string) || "Nhập thông tin cần tra cứu"}</label>
        <input required autoFocus value={q} onChange={(e) => setQ(e.target.value)} className={`${input} font-mono`} />
        {error && <p role="alert" className="rounded-md border border-urgent-500/40 bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</p>}
        <button type="submit" disabled={busy || !q.trim() || columns.length === 0} className="w-full rounded-md bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 disabled:opacity-50">
          {busy ? "Đang tra cứu…" : "Tra cứu"}
        </button>
      </form>
      {fields && (
        <dl className="mt-4 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {fields.map((f) => (
            <div key={f.label} className="grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr]">
              <dt className="text-sm font-semibold text-neutral-500">{f.label}</dt>
              <dd className="break-words text-sm font-semibold text-neutral-900">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function ToolPage() {
  const { slug = "" } = useParams();
  const [tool, setTool] = useState<PublicTool | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    api
      .tool(slug)
      .then((t) => {
        if (!cancelled) {
          setTool(t);
          setState("ok");
        }
      })
      .catch(() => !cancelled && setState("missing"));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === "loading") return <LoadingState />;
  if (state === "missing" || !tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-800">Không tìm thấy chức năng này hoặc đang tạm dừng.</p>
        <Link to="/" className="mt-3 inline-block text-brand-700 hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHero title={tool.name} description={tool.description ?? undefined} breadcrumb={[{ label: tool.name }]} />
      <div className="mx-auto max-w-2xl px-4 py-8">
        {tool.kind === "FORM" ? (
          <>
            <FormTool tool={tool} />
            {tool.config.trackable !== false && <StatusBox tool={tool} />}
          </>
        ) : (
          <LookupTool tool={tool} />
        )}
      </div>
    </div>
  );
}
