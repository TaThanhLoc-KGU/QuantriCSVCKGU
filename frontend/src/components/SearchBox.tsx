import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface SearchBoxProps {
  variant?: "header" | "page";
}

export function SearchBox({ variant = "header" }: SearchBoxProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    navigate(`/tim-kiem?q=${encodeURIComponent(trimmed)}`);
  }

  const isHeader = variant === "header";

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Tìm kiếm tin tức"
      className={isHeader ? "flex w-full max-w-xs" : "flex w-full"}
    >
      <label htmlFor={`search-${variant}`} className="sr-only">
        Tìm kiếm tin tức
      </label>
      <input
        id={`search-${variant}`}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm kiếm tin tức…"
        className={
          isHeader
            ? "w-full rounded-l-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            : "w-full rounded-l-md border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        }
      />
      <button
        type="submit"
        className={
          isHeader
            ? "rounded-r-md bg-brand-600 px-3 text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            : "rounded-r-md bg-brand-600 px-5 text-white transition-colors hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        }
        aria-label="Tìm kiếm"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m17 17-3.5-3.5" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
