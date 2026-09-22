import { useEffect, useRef, useState, type DragEvent } from "react";
import clsx from "clsx";
import { UploadCloudIcon } from "./icons";

export function PublicFileDropzone({
  value,
  onChange,
  hint,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    onChange(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    pick(e.dataTransfer.files?.[0]);
  }

  return (
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
        "relative flex min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
        dragOver ? "border-accent-500 bg-accent-50" : "border-neutral-300 bg-neutral-50 hover:border-accent-400 hover:bg-accent-50/40",
      )}
    >
      {previewUrl ? (
        <>
          <img src={previewUrl} alt="" className="max-h-40 rounded-md object-contain shadow-sm" />
          <p className="mt-1 truncate text-xs font-medium text-neutral-600">{value?.name}</p>
          <p className="text-[11px] text-accent-700">Bấm để chọn ảnh khác</p>
        </>
      ) : (
        <>
          <UploadCloudIcon className="h-7 w-7 text-neutral-400" />
          <p className="text-sm font-medium text-neutral-600">Kéo thả ảnh vào đây, hoặc bấm để chọn</p>
          {hint && <p className="text-xs text-neutral-400">{hint}</p>}
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  );
}
