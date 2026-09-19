import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Banner, Notification, PageResponse, Post } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { useSiteInfo } from "../lib/useSiteInfo";
import { parseLinks } from "../lib/theme";
import { BannerCarousel } from "../components/BannerCarousel";
import { GallerySection } from "../components/GallerySection";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";
import { SectionHeading } from "../components/SectionHeading";
import { NotificationLevelBadge } from "../components/NotificationLevelBadge";
import { LoadingState, ErrorState, EmptyState } from "../components/states";

const PAGE_SIZE = 9;

const DEFAULT_SHORTCUTS = [
  { label: "Biểu mẫu", url: "/bieu-mau" },
  { label: "Công khai", url: "/cong-khai" },
  { label: "Gửi văn bản", url: "/gui-van-ban" },
  { label: "Khôi phục tài khoản", url: "/khoi-phuc-tai-khoan" },
  { label: "Tra cứu email sinh viên", url: "/tra-cuu-email" },
  { label: "Hòm thư góp ý", url: "/hom-thu-gop-y" },
];

function dayMonth(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: "--", month: "" };
  return { day: String(d.getDate()).padStart(2, "0"), month: `Th${d.getMonth() + 1}` };
}

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

export function HomePage() {
  const site = useSiteInfo();
  const { categories } = useCategories("POST");
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Post[]>([]);
  const [notices, setNotices] = useState<Notification[]>([]);
  const [latest, setLatest] = useState<PageResponse<Post> | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([api.banners(), api.featuredPosts(4), api.notifications(), api.posts({ page, size: PAGE_SIZE })])
      .then(([bannerList, featuredList, notificationList, latestPage]) => {
        if (cancelled) return;
        setBanners(bannerList);
        setFeatured(featuredList);
        const sorted = [...notificationList].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.effectiveDate.localeCompare(a.effectiveDate));
        setNotices(sorted.slice(0, 6));
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

  const configured = parseLinks(site.quickLinks).map((l) => ({ label: l.label, url: l.url }));
  const shortcuts = configured.length > 0 ? configured : DEFAULT_SHORTCUTS;
  const lead = banners.length === 0 ? featured[0] : undefined;
  const featuredRest = banners.length === 0 ? featured.slice(1) : featured;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      {/* Trang đầu: hình chính + thông báo, hai khối cao bằng nhau nên không có khoảng trống */}
      <div className="grid gap-5 lg:h-[400px] lg:grid-cols-[minmax(0,1fr)_370px]">
        <div className="h-[240px] sm:h-[320px] lg:h-full">
          {banners.length > 0 ? (
            <BannerCarousel banners={banners} fill />
          ) : lead ? (
            <Link to={`/tin/${lead.slug}`} className="group relative block h-full overflow-hidden rounded-xl bg-neutral-900">
              {lead.thumbnailUrl && <img src={lead.thumbnailUrl} alt="" className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
                <span className="block text-balance text-2xl font-extrabold leading-snug text-white">{lead.title}</span>
              </span>
            </Link>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <span className="text-2xl font-extrabold">{site.name}</span>
            </div>
          )}
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-center justify-between border-b-2 border-brand-700 px-4">
            <h2 className="py-3 text-lg font-extrabold text-brand-800">Thông báo</h2>
            <Link to="/thong-bao" className="text-xs font-semibold text-brand-700 hover:underline">
              Xem tất cả →
            </Link>
          </div>
          {notices.length === 0 ? (
            <p className="px-4 py-6 text-sm text-neutral-500">Chưa có thông báo nào.</p>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-neutral-100 overflow-y-auto">
              {notices.map((n) => {
                const dm = dayMonth(n.effectiveDate);
                return (
                  <li key={n.id}>
                    <Link to="/thong-bao" className="flex gap-3 px-4 py-3 hover:bg-neutral-50">
                      <span className="tnum flex w-11 flex-shrink-0 flex-col items-center justify-center rounded-md bg-brand-50 py-1 leading-none text-brand-800">
                        <b className="text-lg font-extrabold">{dm.day}</b>
                        <span className="mt-0.5 text-[11px] font-semibold">{dm.month}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">{n.title}</span>
                        {(n.level === "URGENT" || n.pinned) && (
                          <span className="mt-1 flex items-center gap-2">
                            <NotificationLevelBadge level={n.level} />
                            {n.pinned && <span className="text-xs font-semibold text-brand-700">Ghim</span>}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>

      {/* Lối tắt: 1 hàng nút, cấu hình ở Giao diện & cấu hình */}
      <nav aria-label="Lối tắt" className="mt-5 flex flex-wrap gap-2">
        {shortcuts.map((s) => {
          const cls =
            "rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-700 hover:bg-brand-700 hover:text-white";
          return isExternal(s.url) ? (
            <a key={s.url + s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={cls}>
              {s.label}
            </a>
          ) : (
            <Link key={s.url + s.label} to={s.url} className={cls}>
              {s.label}
            </Link>
          );
        })}
      </nav>

      {featuredRest.length > 0 && (
        <section className="mt-9">
          <SectionHeading title="Tin nổi bật" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredRest.slice(0, 4).map((post) => (
              <PostCard key={post.id} post={post} categoryName={categoryName(post.categoryId)} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-9">
        <SectionHeading title="Tin mới nhất" />
        {latest && latest.items.length === 0 ? (
          <EmptyState message="Chưa có tin tức nào được đăng." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest?.items.map((post) => (
              <PostCard key={post.id} post={post} categoryName={categoryName(post.categoryId)} />
            ))}
          </div>
        )}
        {latest && <Pagination page={latest.page} totalPages={latest.totalPages} onChange={setPage} />}
      </section>

      <GallerySection />
    </div>
  );
}
