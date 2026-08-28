import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { PageHero } from "../components/PageHero";
import { SendIcon, CheckCircleIcon } from "../components/icons";

const inputClass =
  "block w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export function SubmitDocumentPage() {
  const [title, setTitle] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderOrg, setSenderOrg] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ numberDisplay: string; message: string } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitDocument({ title, senderName, senderOrg, senderEmail, senderPhone, file, website });
      setResult(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gửi văn bản thất bại, vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHero
        icon={<SendIcon className="h-6 w-6" />}
        title="Gửi văn bản đến"
        description="Đơn vị, cá nhân bên ngoài trường có thể gửi tờ trình, đơn đề nghị hoặc văn bản khác đến Phòng Quản trị Cơ sở vật chất qua biểu mẫu dưới đây."
        breadcrumb={[{ label: "Gửi văn bản" }]}
      />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {result ? (
          <div className="animate-fade-up rounded-xl border border-accent-200 bg-accent-50 p-6 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-600 text-white">
              <CheckCircleIcon className="h-7 w-7" />
            </span>
            <p className="mt-4 text-lg font-bold text-accent-900">Đã gửi thành công</p>
            <p className="mt-1 text-sm text-accent-800">{result.message}</p>
            <p className="mt-4 text-xs text-accent-700">
              Vui lòng lưu lại số tiếp nhận <strong>{result.numberDisplay}</strong> để tiện tra cứu khi cần.
            </p>
            <Link to="/" className="mt-5 inline-block text-sm font-medium text-brand-600 hover:underline">
              ← Về trang chủ
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-fade-up space-y-5 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            {/* Honeypot - an voi nguoi that, bot thuong tu dien vao */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700">
                Tiêu đề / Trích yếu <span className="text-urgent-600">*</span>
              </label>
              <textarea
                id="title"
                required
                rows={2}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Tờ trình đề nghị sửa chữa hệ thống điện phòng học A101"
                className={inputClass}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="senderName" className="mb-1 block text-sm font-medium text-neutral-700">
                  Họ tên người gửi <span className="text-urgent-600">*</span>
                </label>
                <input id="senderName" required value={senderName} onChange={(e) => setSenderName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="senderOrg" className="mb-1 block text-sm font-medium text-neutral-700">
                  Đơn vị / Tổ chức
                </label>
                <input id="senderOrg" value={senderOrg} onChange={(e) => setSenderOrg(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="senderEmail" className="mb-1 block text-sm font-medium text-neutral-700">
                  Email <span className="text-urgent-600">*</span>
                </label>
                <input id="senderEmail" type="email" required value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className={inputClass} />
                <p className="mt-1 text-xs text-neutral-400">Dùng để gửi xác nhận và thông báo kết quả xử lý.</p>
              </div>
              <div>
                <label htmlFor="senderPhone" className="mb-1 block text-sm font-medium text-neutral-700">
                  Số điện thoại
                </label>
                <input id="senderPhone" value={senderPhone} onChange={(e) => setSenderPhone(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="file" className="mb-1 block text-sm font-medium text-neutral-700">
                Tệp đính kèm
              </label>
              <input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
              />
              <p className="mt-1 text-xs text-neutral-400">Không bắt buộc. PDF, Word, hoặc ảnh chụp văn bản.</p>
            </div>

            {error && <p className="rounded-md border border-urgent-200 bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SendIcon className="h-4 w-4" />
              {submitting ? "Đang gửi…" : "Gửi văn bản"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
