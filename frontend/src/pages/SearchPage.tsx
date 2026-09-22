import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Post } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { Breadcrumb } from "../components/Breadcrumb";
import { PostCard } from "../components/PostCard";
import { SearchBox } from "../components/SearchBox";
import { LoadingState, ErrorState, EmptyState } from "../components/states";

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { categories } = useCategories("POST");
  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name;

  const [results, setResults] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setResults(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .search(query, 30)
      .then((list) => {
        if (!cancelled) setResults(list);
      })
      .catch(() => {
        if (!cancelled) setError("Tìm kiếm thất bại, vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Breadcrumb items={[{ label: "Tìm kiếm" }]} />

      <div className="mb-6 border-b-2 border-brand-600 pb-4">
        <h1 className="mb-3 text-2xl font-bold text-neutral-900">Tìm kiếm</h1>
        <SearchBox variant="page" />
      </div>

      {!query ? (
        <p className="py-8 text-center text-sm text-neutral-400">Nhập từ khoá để tìm tin tức.</p>
      ) : loading ? (
        <LoadingState message={`Đang tìm "${query}"…`} />
      ) : error ? (
        <ErrorState message={error} />
      ) : results && results.length === 0 ? (
        <EmptyState message={`Không tìm thấy kết quả nào cho "${query}".`} />
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500">
            {results?.length} kết quả cho "<span className="font-medium text-neutral-700">{query}</span>"
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {results?.map((post) => (
              <PostCard key={post.id} post={post} categoryName={categoryName(post.categoryId)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
