import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Banner, Notification, PageResponse, Post } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { BannerCarousel } from "../components/BannerCarousel";
import { GallerySection } from "../components/GallerySection";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";
import { SectionHeading } from "../components/SectionHeading";
import { NotificationLevelBadge } from "../components/NotificationLevelBadge";
import { BellIcon, DocumentStackIcon, ShieldCheckIcon } from "../components/icons";
import { LoadingState, ErrorState, EmptyState } from "../components/states";
import { formatDate } from "../lib/format";

const PAGE_SIZE = 8;

export function HomePage() {
  const { categories } = useCategories("POST");
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Post[]>([]);
  const [pinnedNotifications, setPinnedNotifications] = useState<Notification[]>([]);
  const [latest, setLatest] = useState<PageResponse<Post> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      api.banners(),
      api.featuredPosts(4),
      api.notifications(),
      api.posts({ page, size: PAGE_SIZE }),
    ])
      .then(([bannerList, featuredList, notificationList, latestPage]) => {
        if (cancelled) return;
        setBanners(bannerList);
        setFeatured(featuredList);
        setPinnedNotifications(notificationList.filter((n) => n.pinned).slice(0, 5));
        setLatest(latestPage);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được dữ liệu trang chủ.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (loading && !latest) return <LoadingState message="Đang tải trang chủ…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {banners.length > 0 && (
        <div className="animate-fade-up mb-10">
          <BannerCarousel banners={banners} />
        </div>
      )}

      {featured.length > 0 && (
        <section className="animate-fade-up mb-12">
          <SectionHeading title="Tin nổi bật" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((post) => (
              <PostCard key={post.id} post={post} categoryName={categoryName(post.categoryId)} />
            ))}
          </div>
        </section>
      )}

      <div className="animate-fade-up grid gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <SectionHeading title="Tin mới nhất" />
          {latest && latest.items.length === 0 ? (
            <EmptyState message="Chưa có tin tức nào được đăng." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {latest?.items.map((post) => (
                <PostCard key={post.id} post={post} categoryName={categoryName(post.categoryId)} />
              ))}
            </div>
          )}
          {latest && <Pagination page={latest.page} totalPages={latest.totalPages} onChange={setPage} />}
        </section>

        <aside className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-neutral-100 px-4 py-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <BellIcon className="h-4.5 w-4.5" />
              </span>
              <h2 className="flex-1 text-sm font-bold text-neutral-900">Thông báo ghim</h2>
              <Link to="/thong-bao" className="text-xs font-medium text-brand-600 hover:text-brand-800">
                Xem tất cả
              </Link>
            </div>
            {pinnedNotifications.length === 0 ? (
              <p className="px-4 py-4 text-sm text-neutral-400">Không có thông báo đang ghim.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {pinnedNotifications.map((n) => (
                  <li key={n.id}>
                    <Link to="/thong-bao" className="block px-4 py-3 transition-colors hover:bg-brand-50/50">
                      <div className="mb-1 flex items-center gap-2">
                        <NotificationLevelBadge level={n.level} />
                        <time className="text-xs text-neutral-400">{formatDate(n.effectiveDate)}</time>
                      </div>
                      <p className="text-sm font-medium leading-snug text-neutral-800">{n.title}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-accent-700 to-accent-800 p-5 text-white shadow-sm">
            <div className="blueprint-grid absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative">
              <p className="text-sm font-bold">Biểu mẫu &amp; công khai</p>
              <p className="mt-1 text-sm leading-relaxed text-accent-100">
                Tải biểu mẫu hoặc xem thông tin công khai mua sắm của phòng.
              </p>
              <div className="mt-4 flex flex-col gap-2 text-sm font-medium">
                <Link
                  to="/bieu-mau"
                  className="group flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 transition-colors hover:bg-white/20"
                >
                  <DocumentStackIcon className="h-4 w-4 flex-shrink-0" />
                  Danh sách biểu mẫu
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="ml-auto h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <Link
                  to="/cong-khai"
                  className="group flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 transition-colors hover:bg-white/20"
                >
                  <ShieldCheckIcon className="h-4 w-4 flex-shrink-0" />
                  Công khai mua sắm
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="ml-auto h-3.5 w-3.5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <GallerySection />
    </div>
  );
}
