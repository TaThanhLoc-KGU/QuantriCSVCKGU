import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { PageResponse, Post } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";
import { PageHero } from "../components/PageHero";
import { LoadingState, ErrorState, EmptyState } from "../components/states";

export function AllPostsPage() {
  const { categories } = useCategories("POST");
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<Post> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    api
      .posts({ page, size: 12 })
      .then((r) => !cancelled && setResult(r))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <div>
      <PageHero title="Tất cả bài viết" description="Toàn bộ bài viết mới đăng, xếp theo thời gian." breadcrumb={[{ label: "Tất cả bài viết" }]} />
      <div className="mx-auto max-w-[1200px] px-4 py-8">
        {error ? (
          <ErrorState message="Không tải được danh sách bài viết." />
        ) : !result ? (
          <LoadingState />
        ) : result.items.length === 0 ? (
          <EmptyState message="Chưa có bài viết nào." />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {result.items.map((p) => (
                <PostCard key={p.id} post={p} categoryName={categories.find((c) => c.id === p.categoryId)?.name} />
              ))}
            </div>
            <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
