import type { NotificationLevel } from "../lib/types";

export function NotificationLevelBadge({ level }: { level: NotificationLevel }) {
  if (level !== "URGENT") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-urgent-50 px-1.5 py-0.5 text-xs font-semibold text-urgent-600">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 fill-current">
        <path d="M8 1 1 14h14L8 1Zm0 4.5v4M8 11.5h.01" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      </svg>
      Khẩn
    </span>
  );
}
