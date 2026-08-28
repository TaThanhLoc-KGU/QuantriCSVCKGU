import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { adminApi, ApiError } from "../api";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);
const DOC_EXTS = new Set(["doc", "docx"]);

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot < 0 ? "" : filename.slice(dot + 1).toLowerCase();
}

export function AttachmentPreviewModal({
  documentNumberId,
  filename,
  onClose,
}: {
  documentNumberId: number;
  filename: string;
  onClose: () => void;
}) {
  const ext = extensionOf(filename);
  const isPdf = ext === "pdf";
  const isImage = IMAGE_EXTS.has(ext);
  const isDoc = DOC_EXTS.has(ext);
  const fileUrl = adminApi.documentNumbers.attachmentUrl(documentNumberId);

  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(isDoc);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isDoc) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi.documentNumbers
      .previewText(documentNumberId)
      .then((res) => {
        if (!cancelled) setText(res.text);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : "Không thể đọc nội dung file.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [documentNumberId, isDoc]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />

      <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <FileTypeIcon ext={ext} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">{filename}</p>
              <p className="text-xs text-neutral-500">
                {isPdf ? "Tài liệu PDF" : isImage ? "Hình ảnh" : isDoc ? "Tài liệu Word — xem nội dung văn bản" : "Tệp đính kèm"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <a
              href={fileUrl}
              download={filename}
              className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              title="Tải xuống bản gốc"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v13m0 0-4-4m4 4 4-4M4 20h16" />
              </svg>
            </a>
            <button onClick={onClose} aria-label="Đóng" className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-neutral-50">
          {isPdf && <iframe title={filename} src={fileUrl} className="h-[75vh] w-full border-0" />}

          {isImage && (
            <div className="flex min-h-[50vh] items-center justify-center p-6">
              <img src={fileUrl} alt={filename} className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-sm" />
            </div>
          )}

          {isDoc && (
            <div className="p-6">
              {loading && <p className="text-sm text-neutral-500">Đang tải nội dung…</p>}
              {error && <p className="text-sm text-urgent-600">{error}</p>}
              {!loading && !error && (
                <div className="mx-auto max-w-2xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
                  <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    Nội dung được trích xuất từ file Word — có thể mất định dạng gốc (bảng, ảnh, kiểu chữ). Tải file gốc nếu cần xem đầy đủ.
                  </p>
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-neutral-800">{text}</pre>
                </div>
              )}
            </div>
          )}

          {!isPdf && !isImage && !isDoc && (
            <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-neutral-500">Không thể xem trước loại tệp này ngay trên trang.</p>
              <a href={fileUrl} download={filename} className="rounded-md bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700">
                Tải xuống tệp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function FileTypeIcon({ ext }: { ext: string }) {
  if (ext === "pdf" || DOC_EXTS.has(ext)) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 15-5-5L5 21" />
    </svg>
  );
}
