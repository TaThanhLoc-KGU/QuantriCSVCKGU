import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { StudentEmailLookupResult } from "../lib/types";
import { SearchIcon, IdCardIcon } from "../components/icons";

const inputClass =
  "block w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function StudentEmailLookupPage() {
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StudentEmailLookupResult | null>(null);
  const [copied, setCopied] = useState(false);

  const canSubmit = studentId.trim().length > 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);
    try {
      const res = await api.lookupStudentEmail(studentId.trim());
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tra cứu thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // trinh duyet khong ho tro clipboard - bo qua, nguoi dung tu bam chon
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
          <span className="font-medium text-neutral-800">Tra cứu email sinh viên</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="animate-fade-up">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <SearchIcon className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">Tra cứu email sinh viên</h1>
              <p className="text-sm text-neutral-500">Nhập mã số sinh viên để xem địa chỉ email do trường cấp.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
            <div>
              <label htmlFor="studentId" className="mb-1 block text-sm font-medium text-neutral-700">
                Mã số sinh viên <span className="text-urgent-600">*</span>
              </label>
              <input
                id="studentId"
                required
                autoFocus
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className={`${inputClass} font-mono tracking-wide`}
                placeholder="Ví dụ: 26122001001"
              />
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
              <p className="text-sm text-neutral-500">
                Kết quả cho <span className="font-medium text-neutral-800">{result.fullName}</span>
                {result.className && <span> — Lớp {result.className}</span>}
                {result.major && <span> — {result.major}</span>}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-accent-100 bg-accent-50/50 px-4 py-3">
                <span className="font-mono text-base font-semibold text-neutral-900">{result.email}</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="ml-auto rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  {copied ? "Đã sao chép" : "Sao chép"}
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-3">
            <IdCardIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
            <p className="text-xs leading-relaxed text-neutral-500">
              Không tra cứu được? Kiểm tra lại đúng mã số sinh viên, hoặc{" "}
              <Link to="/khoi-phuc-tai-khoan" className="text-brand-600 hover:underline">
                gửi yêu cầu hỗ trợ khôi phục tài khoản
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
