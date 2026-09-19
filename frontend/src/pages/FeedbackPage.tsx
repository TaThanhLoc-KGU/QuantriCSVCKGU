import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { CheckCircleIcon, SendIcon } from "../components/icons";

const inputClass =
  "block w-full rounded-md border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

const emptyForm = { fullName: "", email: "", phone: "", subject: "", content: "", website: "" };

export function FeedbackPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const canSubmit = form.fullName.trim() && form.subject.trim() && form.content.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.submitFeedback(form);
      setDone(res.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gửi góp ý thất bại, vui lòng thử lại.");
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
          <span className="font-medium text-neutral-800">Hòm thư góp ý</span>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <SendIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Hòm thư góp ý</h1>
            <p className="text-sm text-neutral-500">Gửi ý kiến, đề xuất hoặc phản ánh đến đơn vị.</p>
          </div>
        </div>

        {done ? (
          <div className="rounded-xl border border-accent-200 bg-accent-50 p-6 text-center">
            <CheckCircleIcon className="mx-auto h-8 w-8 text-accent-700" />
            <p className="mt-2 font-semibold text-accent-800">{done}</p>
            <button
              onClick={() => {
                setDone(null);
                setForm(emptyForm);
              }}
              className="mt-4 text-sm text-brand-600 hover:underline"
            >
              Gửi góp ý khác
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative space-y-4 rounded-xl border border-neutral-200 bg-white p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  Họ và tên <span className="text-urgent-600">*</span>
                </label>
                <input required value={form.fullName} onChange={set("fullName")} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Số điện thoại</label>
                <input value={form.phone} onChange={set("phone")} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
              <input type="email" value={form.email} onChange={set("email")} className={inputClass} placeholder="Để nhận phản hồi (không bắt buộc)" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Tiêu đề <span className="text-urgent-600">*</span>
              </label>
              <input required maxLength={300} value={form.subject} onChange={set("subject")} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Nội dung góp ý <span className="text-urgent-600">*</span>
              </label>
              <textarea required rows={6} maxLength={5000} value={form.content} onChange={set("content")} className={inputClass} />
            </div>
            <input
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={set("website")}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              name="website"
            />
            {error && <p className="rounded-md border border-urgent-200 bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</p>}
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Đang gửi…" : "Gửi góp ý"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
