import { Link } from "react-router-dom";
import type { Post } from "../lib/types";
import { formatDate } from "../lib/format";

interface PostCardProps {
  post: Post;
  categoryName?: string;
}

export function PostCard({ post, categoryName }: PostCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md">
      <Link to={`/tin/${post.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-neutral-100">
        {post.thumbnailUrl ? (
          <img
            src={post.thumbnailUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-200">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="16" rx="1.5" />
              <path d="M3 15l5-5 4 4 4-4 5 5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="9" r="1.4" />
            </svg>
          </div>
        )}
        {post.pinned && (
          <span className="absolute left-0 top-0 bg-urgent-500 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">Ghim</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-neutral-900">
          <Link to={`/tin/${post.slug}`} className="hover:text-brand-700">
            {post.title}
          </Link>
        </h3>
        {post.summary && <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-600">{post.summary}</p>}
        <div className="tnum mt-auto flex flex-wrap items-center gap-x-2 pt-2.5 text-xs text-neutral-500">
          {categoryName && <span className="font-semibold text-brand-700">{categoryName}</span>}
          {categoryName && <span aria-hidden="true">·</span>}
          <time dateTime={post.publishedAt ?? undefined}>{formatDate(post.publishedAt ?? post.createdAt)}</time>
          <span className="ml-auto">{post.viewCount} lượt xem</span>
        </div>
      </div>
    </article>
  );
}
