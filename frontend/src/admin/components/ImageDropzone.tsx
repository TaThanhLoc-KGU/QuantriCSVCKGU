import { useRef, useState, type DragEvent } from "react";
import clsx from "clsx";
import { adminApi, ApiError } from "../api";

interface ImageDropzoneProps {
  value: string | null;
  onChange: (url: string) => void;
  folder: string;
  hint?: string;
  aspectClassName?: string;
}

export function ImageDropzone({ value, onChange, folder, hint, aspectClassName = "aspect-[16/9]" }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Chỉ nhận tệp hình ảnh.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const media = await adminApi.media.upload(file, folder);
      onChange(media.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={clsx(
          "relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed transition-colors",
          aspectClassName,
          dragOver ? "border-brand-500 bg-brand-50" : "border-neutral-300 bg-neutral-50 hover:border-brand-400 hover:bg-brand-50/50",
        )}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/0 opacity-0 transition-opacity hover:bg-neutral-900/50 hover:opacity-100">
              <span className="rounded-md bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-800">
                Kéo thả hoặc bấm để đổi ảnh
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-neutral-400">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 15.5 8 10l4 4.5 3-3.5 6 6.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8.5" cy="8.5" r="1.4" />
            </svg>
            <p className="text-sm font-medium text-neutral-600">Kéo thả ảnh vào đây, hoặc bấm để chọn tệp</p>
            {hint && <p className="text-xs text-neutral-400">{hint}</p>}
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 animate-spin text-brand-600">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
              <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])}
      />

      {error && <p className="mt-1.5 text-xs text-urgent-600">{error}</p>}
    </div>
  );
}
