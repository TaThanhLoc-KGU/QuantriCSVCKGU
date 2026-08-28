import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { Post } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { categoryPath } from "../lib/categoryTree";
import { Breadcrumb } from "../components/Breadcrumb";
import { PostRow } from "../components/PostRow";
import { LoadingState, ErrorState } from "../components/states";
import { formatDate } from "../lib/format";
import { ShareButton } from "../components/ShareButton";

export function PostDetailPage() {
  const { slug = "" } = useParams();
  const { categories } = useCategories("POST");

  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setPost(null);

    api
      .postBySlug(slug)
      .then((p) => {
        if (cancelled) return;
        setPost(p);
        window.scrollTo({ top: 0 });
        return api.relatedPosts(slug, 4).then((r) => {
          if (!cancelled) setRelated(r);
        });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError("Không tải được bài viết.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <LoadingState message="Đang tải bài viết…" />;
  if (error) return <ErrorState message={error} />;

  if (notFound || !post) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-800">Không tìm thấy bài viết này.</p>
        <p className="mt-1 text-sm text-neutral-500">Bài viết có thể đã bị gỡ hoặc chưa được đăng.</p>
        <Link to="/" className="mt-4 inline-block text-brand-600 hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === post.categoryId);
  const path = category ? categoryPath(categories, category.id) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <Breadcrumb
        items={[
          ...path.map((c) => ({ label: c.name, to: `/danh-muc/${c.slug}` })),
          { label: post.title },
        ]}
      />

      <div className="animate-fade-up grid gap-10 lg:grid-cols-[1fr_280px]">
        <article className="min-w-0">
          {category && (
            <Link
              to={`/danh-muc/${category.slug}`}
              className="inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
            >
              {category.name}
            </Link>
          )}

          <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-3xl">{post.title}</h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-neutral-200 pb-5 text-sm text-neutral-500">
            <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
            <span className="flex items-center gap-1">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="10" r="2.4" />
              </svg>
              {post.viewCount} lượt xem
            </span>
            <ShareButton title={post.title} />
          </div>

          {post.thumbnailUrl && (
            <img
              src={post.thumbnailUrl}
              alt=""
              className="mt-6 aspect-[16/9] w-full rounded-xl object-cover shadow-sm"
            />
          )}

          {post.summary && (
            <p className="mt-6 border-l-2 border-accent-500 pl-4 text-base font-medium leading-relaxed text-neutral-700">
              {post.summary}
            </p>
          )}

          {post.content && (
            <div className="prose-content mt-6 max-w-[70ch] text-neutral-800" dangerouslySetInnerHTML={{ __html: post.content }} />
          )}
        </article>

        {related.length > 0 && (
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
              <h2 className="border-b border-neutral-100 px-4 py-3 text-sm font-bold text-neutral-900">
                Bài liên quan
              </h2>
              <div className="divide-y divide-neutral-100 px-4">
                {related.map((r) => (
                  <PostRow key={r.id} post={r} />
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
