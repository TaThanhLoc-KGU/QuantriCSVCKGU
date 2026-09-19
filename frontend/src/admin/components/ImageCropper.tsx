import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui";

interface Props {
  file: File;
  aspect: number; // rong / cao cua khung cat
  outputWidth?: number;
  title?: string;
  onConfirm: (cropped: File) => void;
  onUseOriginal?: () => void;
  onCancel: () => void;
}

const VIEW_W = 560;

/** Khung cat anh: kéo để dời, thanh trượt/lăn chuột để phóng to-thu nhỏ, xuất ra ảnh đúng tỉ lệ khung. */
export function ImageCropper({ file, aspect, outputWidth = 1600, title = "Cắt và chỉnh kích thước ảnh", onConfirm, onUseOriginal, onCancel }: Props) {
  const viewH = Math.round(VIEW_W / aspect);
  const [src, setSrc] = useState<string>("");
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const base = natural ? Math.max(VIEW_W / natural.w, viewH / natural.h) : 1;
  const scale = base * zoom;

  function clamp(x: number, y: number, s = scale) {
    if (!natural) return { x, y };
    const minX = VIEW_W - natural.w * s;
    const minY = viewH - natural.h * s;
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) };
  }

  function onLoad() {
    const img = imgRef.current;
    if (!img) return;
    const n = { w: img.naturalWidth, h: img.naturalHeight };
    setNatural(n);
    const s = Math.max(VIEW_W / n.w, viewH / n.h);
    setPos({ x: (VIEW_W - n.w * s) / 2, y: (viewH - n.h * s) / 2 });
  }

  function changeZoom(next: number) {
    if (!natural) return;
    const z = Math.min(4, Math.max(1, next));
    const s2 = base * z;
    // Giu nguyen tam khung khi phong to/thu nho.
    const cx = (VIEW_W / 2 - pos.x) / scale;
    const cy = (viewH / 2 - pos.y) / scale;
    setZoom(z);
    setPos(clamp(VIEW_W / 2 - cx * s2, viewH / 2 - cy * s2, s2));
  }

  function confirm() {
    if (!natural || !imgRef.current) return;
    const outW = outputWidth;
    const outH = Math.round(outputWidth / aspect);
    const k = outW / VIEW_W;
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imgRef.current, pos.x * k, pos.y * k, natural.w * scale * k, natural.h * scale * k);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const name = file.name.replace(/\.[^.]+$/, "") + "-crop.jpg";
        onConfirm(new File([blob], name, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-[620px] bg-white p-5 shadow-xl">
        <h2 className="text-base font-extrabold text-neutral-900">{title}</h2>
        <p className="mb-3 mt-1 text-xs text-neutral-600">Kéo ảnh để chọn vùng hiển thị, dùng thanh trượt (hoặc lăn chuột) để phóng to/thu nhỏ. Phần nằm trong khung là phần sẽ hiện ra.</p>

        <div
          className="relative mx-auto cursor-grab touch-none select-none overflow-hidden bg-neutral-200 active:cursor-grabbing"
          style={{ width: VIEW_W, maxWidth: "100%", aspectRatio: `${aspect}` }}
          onPointerDown={(e) => {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            // Ti le hien thi co the nho hon VIEW_W tren man hinh hep.
            const ratio = VIEW_W / (e.currentTarget as HTMLElement).clientWidth;
            setPos(clamp(drag.current.x + (e.clientX - drag.current.px) * ratio, drag.current.y + (e.clientY - drag.current.py) * ratio));
          }}
          onPointerUp={() => (drag.current = null)}
          onWheel={(e) => changeZoom(zoom - e.deltaY * 0.002)}
        >
          {src && (
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={onLoad}
              draggable={false}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: natural ? natural.w * scale * (1) : "auto",
                height: natural ? natural.h * scale : "auto",
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                maxWidth: "none",
                transformOrigin: "0 0",
              }}
            />
          )}
        </div>

        <label className="mt-4 flex items-center gap-3 text-sm text-neutral-700">
          <span className="w-20 flex-shrink-0 font-semibold">Phóng to</span>
          <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => changeZoom(Number(e.target.value))} className="w-full accent-[var(--color-brand-700)]" />
          <span className="tnum w-10 text-right">{Math.round(zoom * 100)}%</span>
        </label>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {onUseOriginal && (
            <Button variant="ghost" onClick={onUseOriginal} className="mr-auto">
              Dùng ảnh gốc, không cắt
            </Button>
          )}
          <Button variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
          <Button onClick={confirm} disabled={!natural}>
            Cắt và tải lên
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
