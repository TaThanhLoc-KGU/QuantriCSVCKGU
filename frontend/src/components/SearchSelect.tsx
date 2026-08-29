import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, SearchIcon } from "./icons";

export interface SearchSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Gõ để tìm…",
  emptyLabel = "Không tìm thấy kết quả",
  id,
}: {
  options: SearchSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((o) => o.value === value) ?? null, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q));
  }, [options, query]);

  function openMenu() {
    const el = anchorRef.current;
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX, width: r.width });
    }
    setOpen(true);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node;
      if (anchorRef.current?.contains(target) || popoverRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div>
      <button
        id={id}
        ref={anchorRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2.5 text-left text-sm text-neutral-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      >
        {selected ? (
          <span className="min-w-0 truncate">
            <span className="font-medium">{selected.value}</span>
            {selected.sublabel && <span className="text-neutral-500"> — {selected.sublabel}</span>}
          </span>
        ) : (
          <span className="text-neutral-400">{placeholder}</span>
        )}
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "absolute", top: rect.top, left: rect.left, width: Math.max(rect.width, 280) }}
            className="z-50 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg"
          >
            <div className="flex items-center gap-2 border-b border-neutral-100 px-3 py-2">
              <SearchIcon className="h-4 w-4 shrink-0 text-neutral-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 && <li className="px-3 py-4 text-center text-sm text-neutral-400">{emptyLabel}</li>}
              {filtered.slice(0, 200).map((o) => (
                <li key={o.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-brand-50 ${o.value === value ? "bg-brand-50" : ""}`}
                  >
                    <span className="font-medium text-neutral-900">{o.value}</span>
                    {o.sublabel && <span className="text-xs text-neutral-500">{o.sublabel}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}
