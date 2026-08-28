import { Link } from "react-router-dom";
import type { Post } from "../lib/types";
import { formatDate } from "../lib/format";

interface PostRowProps {
  post: Post;
}

export function PostRow({ post }: PostRowProps) {
  return (
    <article className="flex gap-3 py-3">
      <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
      <div className="min-w-0">
        <h4 className="text-sm font-medium leading-snug text-neutral-800">
          <Link to={`/tin/${post.slug}`} className="hover:text-brand-700">
            {post.title}
          </Link>
        </h4>
        <time dateTime={post.publishedAt ?? undefined} className="mt-1 block text-xs text-neutral-400">
          {formatDate(post.publishedAt ?? post.createdAt)}
        </time>
      </div>
    </article>
  );
}
