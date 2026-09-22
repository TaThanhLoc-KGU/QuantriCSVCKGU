import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { PublicDisclosureResponse } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { PageHero } from "../components/PageHero";
import { ShieldCheckIcon } from "../components/icons";
import { PostCard } from "../components/PostCard";
import { SectionHeading } from "../components/SectionHeading";
import { LoadingState, ErrorState, EmptyState } from "../components/states";
import { formatDate } from "../lib/format";

export function DisclosuresPage() {
  const { categories } = useCategories("POST");
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  const [data, setData] = useState<PublicDisclosureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .disclosures()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được thông tin công khai.");
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
        icon={<ShieldCheckIcon className="h-6 w-6" />}
        title="Công khai"
        description="Thông tin công khai mua sắm, đấu thầu và tài sản của Phòng Quản trị Cơ sở vật chất — dành cho đơn vị, nhà thầu và đối tác."
        breadcrumb={[{ label: "Công khai" }]}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : data && data.posts.length === 0 && data.notifications.length === 0 ? (
          <EmptyState message="Hiện chưa có nội dung công khai nào." />
        ) : (
          <div className="animate-fade-up space-y-10">
            {data && data.notifications.length > 0 && (
              <section>
                <SectionHeading title="Thông báo mua sắm" />
                <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                  {data.notifications.map((n) => (
                    <li key={n.id} className="p-4 transition-colors hover:bg-brand-50/40">
                      <time className="text-xs text-neutral-400">{formatDate(n.effectiveDate)}</time>
                      <p className="mt-0.5 font-medium text-neutral-900">{n.title}</p>
                      {n.content && (
                        <div
                          className="prose-content mt-2 text-sm text-neutral-600"
                          dangerouslySetInnerHTML={{ __html: n.content }}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {data && data.posts.length > 0 && (
              <section>
                <SectionHeading title="Bài viết công khai" />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {data.posts.map((post) => (
                    <PostCard key={post.id} post={post} categoryName={categoryName(post.categoryId)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
