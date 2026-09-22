import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { GalleryItem } from "../lib/types";
import { SectionHeading } from "./SectionHeading";

export function youtubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

/** Thư viện ảnh + video ở trang chủ (ảnh mở lightbox đơn giản, video nhúng YouTube). */
export function GallerySection() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [open, setOpen] = useState<GalleryItem | null>(null);

  useEffect(() => {
    api.gallery().then(setItems).catch(() => undefined);
  }, []);

  const images = items.filter((i) => i.type === "IMAGE");
  const videos = items.filter((i) => i.type === "VIDEO");
  if (items.length === 0) return null;

  return (
    <section className="animate-fade-up mt-12 grid gap-10 lg:grid-cols-2">
      {images.length > 0 && (
        <div>
          <SectionHeading title="Thư viện ảnh" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {images.slice(0, 8).map((img) => (
              <button key={img.id} type="button" onClick={() => setOpen(img)} className="group aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <img src={img.url} alt={img.title ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </button>
            ))}
          </div>
        </div>
      )}
      {videos.length > 0 && (
        <div>
          <SectionHeading title="Video clip" />
          <div className="space-y-4">
            {videos.slice(0, 2).map((v) => {
              const embed = youtubeEmbedUrl(v.url);
              return (
                <figure key={v.id}>
                  {embed ? (
                    <iframe src={embed} title={v.title ?? "Video"} loading="lazy" allowFullScreen className="aspect-video w-full rounded-lg border border-neutral-200" />
                  ) : (
                    <video src={v.url} controls className="aspect-video w-full rounded-lg bg-black" />
                  )}
                  {v.title && <figcaption className="mt-1.5 text-sm text-neutral-600">{v.title}</figcaption>}
                </figure>
              );
            })}
          </div>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <figure className="max-h-full max-w-4xl">
            <img src={open.url} alt={open.title ?? ""} className="max-h-[85vh] rounded-lg object-contain" />
            {open.title && <figcaption className="mt-2 text-center text-sm text-white">{open.title}</figcaption>}
          </figure>
        </div>
      )}
    </section>
  );
}
