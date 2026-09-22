import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { PageResponse, Post } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { categoryPath, findCategoryBySlug } from "../lib/categoryTree";
import { PostCard } from "../components/PostCard";
import { Pagination } from "../components/Pagination";
import { PageHero } from "../components/PageHero";
import { FolderIcon } from "../components/icons";
import { LoadingState, ErrorState, EmptyState } from "../components/states";

const PAGE_SIZE = 12;

export function CategoryPage() {
  const { slug = "" } = useParams();
  const { categories, loading: categoriesLoading } = useCategories("POST");
  const category = findCategoryBySlug(categories, slug);

  const [page, setPage] = useState(0);
  const [result, setResult] = useState<PageResponse<Post> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const children = categories.filter((c) => c.parentId === category?.id);

  useEffect(() => {
    setPage(0);
  }, [slug]);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .posts({ category: category.id, page, size: PAGE_SIZE })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được danh sách bài viết.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, page]);

  if (categoriesLoading) return <LoadingState />;

  if (!category) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-800">Không tìm thấy danh mục này.</p>
        <Link to="/" className="mt-3 inline-block text-brand-600 hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const path = categoryPath(categories, category.id);
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  return (
    <div>
      <PageHero
        icon={<FolderIcon className="h-6 w-6" />}
        title={category.name}
        description={category.description ?? undefined}
        breadcrumb={path.map((c, i) => ({ label: c.name, to: i < path.length - 1 ? `/danh-muc/${c.slug}` : undefined }))}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {children.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {children.map((child) => (
              <Link
                key={child.id}
                to={`/danh-muc/${child.slug}`}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {loading && !result ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : result && result.items.length === 0 ? (
          <EmptyState message="Chưa có bài viết nào trong danh mục này." />
        ) : (
          <div className="animate-fade-up">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {result?.items.map((post) => (
                <PostCard key={post.id} post={post} categoryName={categoryName(post.categoryId)} />
              ))}
            </div>
            {result && <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />}
          </div>
        )}
      </div>
    </div>
  );
}
