import { useState } from "react";
import { Link } from "react-router-dom";
import { usePendingSubmissions } from "../usePendingSubmissions";

export function NotificationBell() {
  const items = usePendingSubmissions();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100"
        aria-label="Thông báo"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 9a6 6 0 1 1 12 0c0 3.2 1 5.2 1.7 6.2a.8.8 0 0 1-.65 1.3H4.95a.8.8 0 0 1-.65-1.3C5 14.2 6 12.2 6 9Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
        </svg>
        {items.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-urgent-600 px-1 text-[10px] font-bold text-white">
            {items.length > 9 ? "9+" : items.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <button className="fixed inset-0 z-40 cursor-default" aria-label="Đóng" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
            <div className="border-b border-neutral-100 px-4 py-2.5">
              <p className="text-sm font-semibold text-neutral-900">Văn bản chờ xử lý</p>
              <p className="text-xs text-neutral-500">Nộp qua trang công khai, chưa đánh dấu hoàn thành</p>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-neutral-400">Không có văn bản nào đang chờ.</p>
            ) : (
              <ul className="max-h-80 divide-y divide-neutral-100 overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      to="/admin/van-ban"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 hover:bg-brand-50/50"
                    >
                      <p className="font-mono text-xs text-brand-600">{item.numberDisplay}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-neutral-800">{item.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/admin/nhiem-vu"
              onClick={() => setOpen(false)}
              className="block border-t border-neutral-100 px-4 py-2.5 text-center text-xs font-medium text-brand-600 hover:bg-neutral-50"
            >
              Xem trong Nhiệm vụ →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
