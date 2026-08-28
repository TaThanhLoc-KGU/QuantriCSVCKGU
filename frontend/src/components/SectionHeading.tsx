import { Link } from "react-router-dom";

interface SectionHeadingProps {
  title: string;
  viewAllHref?: string;
}

export function SectionHeading({ title, viewAllHref }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3 border-b border-neutral-200 pb-3">
      <div>
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        <span aria-hidden="true" className="mt-1.5 block h-1 w-9 rounded-full bg-accent-500" />
      </div>
      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="group flex flex-shrink-0 items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-800"
        >
          Xem tất cả
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}
    </div>
  );
}
