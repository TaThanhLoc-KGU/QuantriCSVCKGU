import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { formatDateTime } from "../lib/format";
import { SearchIcon, CheckCircleIcon, IdCardIcon } from "../components/icons";

const inputClass =
  "block w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

type LookupResult = {
  status: "MOI" | "DA_XU_LY" | "TU_CHOI";
  fullName: string;
  resultMessage: string | null;
  createdAt: string;
  processedAt: string | null;
};

const STATUS_META: Record<LookupResult["status"], { label: string; className: string }> = {
  MOI: { label: "Đang chờ xử lý", className: "bg-amber-50 text-amber-800 border-amber-200" },
  DA_XU_LY: { label: "Đã xử lý", className: "bg-accent-50 text-accent-800 border-accent-200" },
  TU_CHOI: { label: "Từ chối", className: "bg-urgent-50 text-urgent-700 border-urgent-200" },
};

export function AccountRecoveryLookupPage() {
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const canSubmit = query.trim().length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.lookupAccountRecovery(query.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tra cứu thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-neutral-50">
      <div className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-3.5 text-sm">
          <Link to="/" className="text-neutral-500 hover:text-brand-600">
            Trang chủ
          </Link>
          <span className="text-neutral-300">/</span>
          <Link to="/khoi-phuc-tai-khoan" className="text-neutral-500 hover:text-brand-600">
            Hỗ trợ khôi phục tài khoản
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="font-medium text-neutral-800">Tra cứu kết quả</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="animate-fade-up">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <SearchIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Tra cứu kết quả xử lý</h1>
              <p className="text-sm text-neutral-500">Nhập 1 trong 4 thông tin sau để xem tình trạng hồ sơ của bạn.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
            <div>
              <label htmlFor="query" className="mb-1 block text-sm font-medium text-neutral-700">
                Mã hồ sơ, mã số sinh viên, số điện thoại hoặc số CCCD <span className="text-urgent-600">*</span>
              </label>
              <input
                id="query"
                required
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${inputClass} font-mono tracking-wide`}
                placeholder="Ví dụ: KP-XXXXXXXX hoặc 2024012345"
              />
              <p className="mt-1 text-xs text-neutral-400">Chỉ cần nhập đúng 1 trong 4 thông tin, không cần nhập hết.</p>
            </div>

            {error && <p className="rounded-md border border-urgent-200 bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</p>}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang tra cứu…" : "Tra cứu"}
            </button>
          </form>

          {result && (
            <div className="animate-fade-up mt-5 rounded-xl border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-neutral-500">
                  Hồ sơ của <span className="font-medium text-neutral-800">{result.fullName}</span>
                </p>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_META[result.status].className}`}>
                  {STATUS_META[result.status].label}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-400">Gửi lúc {formatDateTime(result.createdAt)}</p>

              {result.status === "MOI" && (
                <p className="mt-4 rounded-md bg-neutral-50 px-3 py-2.5 text-sm text-neutral-600">
                  Yêu cầu của bạn đang chờ Phòng Quản trị Cơ sở vật chất xử lý. Vui lòng quay lại tra cứu sau.
                </p>
              )}

              {result.resultMessage && (
                <div className="mt-4 rounded-lg border border-accent-100 bg-accent-50/50 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-accent-800">
                    <CheckCircleIcon className="h-4 w-4" />
                    Kết quả xử lý
                    {result.processedAt && <span className="font-normal text-accent-600">— {formatDateTime(result.processedAt)}</span>}
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">{result.resultMessage}</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-3">
            <IdCardIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
            <p className="text-xs leading-relaxed text-neutral-500">
              Không tra cứu được? Kiểm tra lại đúng thông tin đã dùng khi gửi yêu cầu, hoặc{" "}
              <Link to="/khoi-phuc-tai-khoan" className="text-brand-600 hover:underline">
                gửi yêu cầu mới
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
