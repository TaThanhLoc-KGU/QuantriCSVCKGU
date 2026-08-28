interface StateProps {
  message?: string;
}

export function LoadingState({ message = "Đang tải…" }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-neutral-400">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 animate-spin">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
        <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Có lỗi xảy ra, vui lòng thử lại." }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-urgent-500/20 bg-urgent-50 py-12 text-center">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-urgent-600" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-urgent-600">{message}</p>
    </div>
  );
}

export function EmptyState({ message = "Chưa có nội dung." }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-neutral-400">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3.5" y="6" width="17" height="14" rx="1.5" />
        <path d="M3.5 10h17M8 3.5v5M16 3.5v5" strokeLinecap="round" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
