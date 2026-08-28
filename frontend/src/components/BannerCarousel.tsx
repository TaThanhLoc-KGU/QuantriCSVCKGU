import { useEffect, useRef, useState } from "react";
import type { Banner } from "../lib/types";

interface BannerCarouselProps {
  banners: Banner[];
}

const AUTO_ADVANCE_MS = 6000;

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (banners.length <= 1 || prefersReducedMotion.current) return;
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timerRef.current);
  }, [banners.length]);

  if (banners.length === 0) return null;

  function goTo(next: number) {
    window.clearInterval(timerRef.current);
    setIndex((next + banners.length) % banners.length);
  }

  const current = banners[index];

  const slide = (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-200 shadow-lg sm:aspect-[3/1]">
      <img
        key={current.id}
        src={current.imageUrl}
        alt={current.title}
        className={`h-full w-full object-cover ${!prefersReducedMotion.current ? "animate-ken-burns" : ""}`}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 py-5 sm:px-7 sm:py-6">
        <p className="max-w-2xl text-base font-bold leading-snug text-white drop-shadow-sm sm:text-xl">{current.title}</p>
        {current.linkUrl && (
          <span className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold text-brand-800 shadow-sm transition-colors group-hover:bg-white sm:inline-flex">
            Xem thêm
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="group relative" role="region" aria-roledescription="carousel" aria-label="Banner giới thiệu">
      {current.linkUrl ? (
        <a href={current.linkUrl} className="block" target="_blank" rel="noopener noreferrer">
          {slide}
        </a>
      ) : (
        slide
      )}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 opacity-0 shadow-md transition-all duration-200 hover:bg-white group-hover:opacity-100"
            aria-label="Banner trước"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m12 15-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-700 opacity-0 shadow-md transition-all duration-200 hover:bg-white group-hover:opacity-100"
            aria-label="Banner sau"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Đến banner ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
