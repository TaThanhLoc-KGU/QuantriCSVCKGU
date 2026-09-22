interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

function pageNumbers(page: number, totalPages: number): (number | "...")[] {
  const items: (number | "...")[] = [];
  const add = (n: number) => items.push(n);

  add(0);
  if (page > 2) items.push("...");
  for (let p = Math.max(1, page - 1); p <= Math.min(totalPages - 2, page + 1); p++) {
    add(p);
  }
  if (page < totalPages - 3) items.push("...");
  if (totalPages > 1) add(totalPages - 1);

  return [...new Set(items.map((i) => (i === "..." ? i : i)))].filter(
    (v, i, arr) => v !== "..." || arr[i - 1] !== "..."
  );
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Phân trang" className="mt-8 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang trước"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m12 15-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {pageNumbers(page, totalPages).map((item, idx) =>
        item === "..." ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-sm text-neutral-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors ${
              item === page
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {item + 1}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang sau"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}
