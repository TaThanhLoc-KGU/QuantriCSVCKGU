import { Link } from "react-router-dom";
import type { Post } from "../lib/types";
import { formatDate } from "../lib/format";

interface PostCardProps {
  post: Post;
  categoryName?: string;
}

export function PostCard({ post, categoryName }: PostCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl">
      <Link to={`/tin/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-neutral-100">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-neutral-100 text-brand-200">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="16" rx="1.5" />
              <path d="M3 15l5-5 4 4 4-4 5 5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="9" r="1.4" />
            </svg>
          </div>
        )}
        {post.pinned && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent-600/95 px-2 py-0.5 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3 w-3 fill-current">
              <path d="M8 1l1.5 4.5L14 7l-4 3 1 4.5L8 12l-3 2.5 1-4.5-4-3 4.5-1.5z" />
            </svg>
            Ghim
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-neutral-400">
          {categoryName && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">{categoryName}</span>
          )}
          <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
        </div>
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900">
          <Link to={`/tin/${post.slug}`} className="transition-colors hover:text-brand-700">
            {post.title}
          </Link>
        </h3>
        {post.summary && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600">{post.summary}</p>
        )}
        <div className="mt-auto flex items-center gap-1 pt-3 text-xs text-neutral-400">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M1 10s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="10" r="2.4" />
          </svg>
          {post.viewCount}
        </div>
      </div>
    </article>
  );
}
