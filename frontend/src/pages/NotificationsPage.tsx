import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Notification } from "../lib/types";
import { PageHero } from "../components/PageHero";
import { BellIcon } from "../components/icons";
import { NotificationLevelBadge } from "../components/NotificationLevelBadge";
import { LoadingState, ErrorState, EmptyState } from "../components/states";
import { formatDate } from "../lib/format";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .notifications()
      .then((list) => {
        if (!cancelled) setNotifications(list);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được danh sách thông báo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHero
        icon={<BellIcon className="h-6 w-6" />}
        title="Thông báo"
        description="Thông báo chung của Phòng Quản trị Cơ sở vật chất còn hiệu lực."
        breadcrumb={[{ label: "Thông báo" }]}
      />

      <div className="mx-auto max-w-3xl px-4 py-8">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : notifications && notifications.length === 0 ? (
        <EmptyState message="Hiện chưa có thông báo nào còn hiệu lực." />
      ) : (
        <ul className="animate-fade-up divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          {notifications?.map((n) => {
            const isOpen = openId === n.id;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : n.id)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-neutral-50"
                  aria-expanded={isOpen}
                >
                  {n.pinned && (
                    <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-1 h-4 w-4 flex-shrink-0 fill-accent-600">
                      <path d="M8 1l1.5 4.5L14 7l-4 3 1 4.5L8 12l-3 2.5 1-4.5-4-3 4.5-1.5z" />
                    </svg>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <NotificationLevelBadge level={n.level} />
                      <time className="text-xs text-neutral-400">
                        Hiệu lực từ {formatDate(n.effectiveDate)}
                        {n.expiryDate && ` đến ${formatDate(n.expiryDate)}`}
                      </time>
                    </div>
                    <p className="font-medium text-neutral-900">{n.title}</p>
                  </div>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className={`mt-1 h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && n.content && (
                  <div className="prose-content border-t border-neutral-100 bg-neutral-50 px-4 py-4 text-sm text-neutral-700" dangerouslySetInnerHTML={{ __html: n.content }} />
                )}
              </li>
            );
          })}
        </ul>
      )}
      </div>
    </div>
  );
}
