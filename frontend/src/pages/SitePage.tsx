import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import type { PageDetail, ResolvedPageBlock } from "../lib/types";
import { PostCard } from "../components/PostCard";
import { PageHero } from "../components/PageHero";
import { DataTableBlockView } from "../components/DataTableBlockView";
import { FolderIcon } from "../components/icons";
import { LoadingState, ErrorState, EmptyState } from "../components/states";

function Block({ block }: { block: ResolvedPageBlock }) {
  return (
    <section className="mb-10 last:mb-0">
      {block.title && <h2 className="mb-4 text-xl font-bold text-neutral-900">{block.title}</h2>}

      {block.type === "RICH_TEXT" && (
        <div
          className="prose-content"
          dangerouslySetInnerHTML={{ __html: (block.config.html as string) || "" }}
        />
      )}

      {block.type === "POST_LIST" &&
        (block.posts.length === 0 ? (
          <EmptyState message="Chưa có tin nào." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {block.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ))}

      {block.type === "DATA_TABLE" && <DataTableBlockView block={block} />}

      {block.type === "STAFF_LIST" &&
        (block.staff.length === 0 ? (
          <EmptyState message="Chưa có nhân sự nào." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.staff.map((member) => (
              <div key={member.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-neutral-900">{member.name}</p>
                {member.position && <p className="mt-0.5 text-sm text-brand-600">{member.position}</p>}
                <div className="mt-2 space-y-1 text-sm text-neutral-500">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="block hover:text-brand-600 hover:underline">
                      {member.email}
                    </a>
                  )}
                  {member.phone && <p>{member.phone}</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
    </section>
  );
}

export function SitePage() {
  const params = useParams();
  const path = params["*"] ?? "";

  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .resolvePage(path)
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError && err.status === 404 ? "not-found" : "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (loading) return <LoadingState />;

  if (error === "not-found" || !detail) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-800">Không tìm thấy trang này.</p>
        <Link to="/" className="mt-3 inline-block text-brand-600 hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <ErrorState message="Không tải được nội dung trang." />
      </div>
    );
  }

  const segments = path.split("/").filter(Boolean);
  const breadcrumb = detail.breadcrumb.map((c, i) => ({
    label: c.name,
    to: i < detail.breadcrumb.length - 1 ? `/trang/${segments.slice(0, i + 1).join("/")}` : undefined,
  }));

  return (
    <div>
      <PageHero icon={<FolderIcon className="h-6 w-6" />} title={detail.category.name} description={detail.category.description ?? undefined} breadcrumb={breadcrumb} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {detail.children.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {detail.children.map((child) => (
              <Link
                key={child.id}
                to={`/trang/${path}/${child.slug}`}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {detail.blocks.length === 0 ? (
          <EmptyState message="Trang này chưa có nội dung." />
        ) : (
          <div className="animate-fade-up">
            {detail.blocks.map((block) => (
              <Block key={block.id} block={block} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
