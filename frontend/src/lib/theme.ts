import type { SiteInfo } from "./types";

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
// Do sang muc tieu (%) cho tung bac, giu nguyen sac do (hue) cua mau goc.
const LIGHTNESS = [96, 90, 80, 68, 56, 45, 37, 28, 20, 12];

function hexToHsl(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%)`;
}

/** Sinh thang 10 bac (50..900) tu 1 mau goc; bac 600 xap xi mau goc de nut/ nen chinh dung dung mau da chon. */
export function buildScale(hex: string): Record<number, string> | null {
  const parsed = hexToHsl(hex);
  if (!parsed) return null;
  const [h, s] = parsed;
  const out: Record<number, string> = {};
  STEPS.forEach((step, i) => {
    const light = LIGHTNESS[i];
    // Bac nhat/ dam it bao hoa hon de khong bi "chay" mau.
    const sat = light > 85 ? s * 0.55 : light < 20 ? s * 0.8 : s;
    out[step] = hsl(h, Math.min(sat, 92), light);
  });
  out[600] = hex;
  return out;
}

const RADIUS: Record<string, Record<string, string>> = {
  sharp: { sm: "0px", md: "2px", lg: "3px", xl: "4px", "2xl": "6px" },
  soft: { sm: "3px", md: "6px", lg: "8px", xl: "12px", "2xl": "16px" },
  round: { sm: "6px", md: "10px", lg: "14px", xl: "20px", "2xl": "28px" },
};

const CACHE_KEY = "qtcsvc.theme";

/** Ap dung mau/goc bo/kieu header len :root - tat ca lop tien ich Tailwind (bg-brand-*, rounded-*) doi theo. */
export function applyTheme(info: Pick<SiteInfo, "primaryColor" | "accentColor" | "radius" | "headerStyle">) {
  const root = document.documentElement;
  const brand = buildScale(info.primaryColor);
  const accent = buildScale(info.accentColor);
  if (brand) STEPS.forEach((s) => root.style.setProperty(`--color-brand-${s}`, brand[s]));
  if (accent) STEPS.forEach((s) => root.style.setProperty(`--color-accent-${s}`, accent[s]));
  const r = RADIUS[info.radius] ?? RADIUS.sharp;
  Object.entries(r).forEach(([k, v]) => root.style.setProperty(`--radius-${k}`, v));
  root.dataset.header = info.headerStyle === "light" ? "light" : "solid";
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(info));
  } catch {
    // khong luu duoc cache - bo qua, lan sau tai lai tu API
  }
}

/** Ap dung ngay tu ban luu lan truoc de tranh chop mau khi tai trang. */
export function applyCachedTheme() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) applyTheme(JSON.parse(raw));
  } catch {
    // du lieu cache hong - bo qua
  }
}

export interface LinkItem {
  label: string;
  url: string;
}

/** Doc danh sach lien ket tu chuoi nhieu dong "Nhan | duong-dan". */
export function parseLinks(text: string | undefined): LinkItem[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [label, url] = l.split("|").map((x) => x.trim());
      return { label, url: url ?? "" };
    })
    .filter((l) => l.label && l.url);
}
