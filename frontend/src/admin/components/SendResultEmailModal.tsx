import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { adminApi, ApiError } from "../api";
import { Button, TextInput, Textarea } from "./ui";

export function SendResultEmailModal({
  requestId,
  toEmail,
  defaultSubject,
  defaultBody,
  onClose,
  onSent,
}: {
  requestId: number;
  toEmail: string;
  defaultSubject: string;
  defaultBody: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      await adminApi.accountRecovery.sendResult(requestId, subject.trim(), body);
      setSent(true);
      onSent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gửi email thất bại.");
    } finally {
      setSending(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      <div className="relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Gửi kết quả qua email</p>
            <p className="text-xs text-neutral-500">Đến: {toEmail}</p>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-accent-700">Đã gửi email thành công.</p>
            <Button className="mt-4" onClick={onClose}>Đóng</Button>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <div>
              <label htmlFor="rr-subject" className="mb-1 block text-sm font-medium text-neutral-700">Tiêu đề</label>
              <TextInput id="rr-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label htmlFor="rr-body" className="mb-1 block text-sm font-medium text-neutral-700">Nội dung</label>
              <Textarea id="rr-body" rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
              <p className="mt-1 text-xs text-neutral-400">
                Bạn có thể chỉnh sửa tự do. Nội dung này sẽ được gửi qua email, đồng thời hiển thị khi người gửi tra cứu kết quả trên web,
                và tự động chuyển hồ sơ sang trạng thái "Đã xử lý".
              </p>
            </div>

            {error && <p className="rounded-md border border-urgent-200 bg-urgent-50 px-3 py-2 text-sm text-urgent-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={onClose}>Huỷ</Button>
              <Button onClick={handleSend} disabled={sending || !subject.trim() || !body.trim()}>
                {sending ? "Đang gửi…" : "Gửi email"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
