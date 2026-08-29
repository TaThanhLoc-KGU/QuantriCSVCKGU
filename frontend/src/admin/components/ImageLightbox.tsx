import { useEffect } from "react";
import { createPortal } from "react-dom";

export function ImageLightbox({ src, title, onClose }: { src: string; title: string; onClose: () => void }) {
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="Đóng" onClick={onClose} className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm" />
      <div className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
          <p className="truncate text-sm font-semibold text-neutral-900">{title}</p>
          <div className="flex shrink-0 items-center gap-1">
            <a href={src} download={title} className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900" title="Tải xuống">
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
        <div className="flex-1 overflow-auto bg-neutral-50 p-6">
          <img src={src} alt={title} className="mx-auto max-h-[70vh] max-w-full rounded-lg object-contain shadow-sm" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
