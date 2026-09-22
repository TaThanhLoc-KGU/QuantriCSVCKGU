import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, ApiError } from "../api";
import type { Category, Post, PostStatus } from "../../lib/types";
import { formatDate } from "../../lib/format";
import { Badge, Card, EmptyState, ErrorBanner, LoadingState, PageHeader, Select, TextInput } from "../components/ui";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function PostsListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PostStatus | "">("");
  const [category, setCategory] = useState<number | "">("");
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<Post | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    adminApi.posts
      .list({ status: status || undefined, category: category || undefined, q: q || undefined })
      .then(setPosts)
      .catch(() => setError("Không thể tải danh sách bài viết."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    adminApi.categories.list("POST").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, category, q]);

  function categoryName(id: number) {
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  async function togglePublish(p: Post) {
    try {
      await adminApi.posts.setPublish(p.id, p.status !== "PUBLISHED");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể đổi trạng thái đăng.");
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.posts.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá bài viết thất bại.");
      setToDelete(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Bài viết"
        description="Tin hoạt động, công khai và các bài viết khác."
        actions={
          <Link
            to="/admin/bai-viet/moi"
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            + Viết bài mới
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <TextInput placeholder="Tìm theo tiêu đề…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={category} onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : "")} className="max-w-48">
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value as PostStatus | "")} className="max-w-40">
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="PUBLISHED">Đã đăng</option>
        </Select>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}
      {!loading && posts.length === 0 && <EmptyState title="Chưa có bài viết nào" description="Bấm “Viết bài mới” để bắt đầu." />}

      {!loading && posts.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Tiêu đề</th>
                <th className="px-5 py-2 font-medium">Danh mục</th>
                <th className="px-5 py-2 font-medium">Trạng thái</th>
                <th className="px-5 py-2 font-medium">Lượt xem</th>
                <th className="px-5 py-2 font-medium">Cập nhật</th>
                <th className="px-5 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-5 py-2.5 text-neutral-900">
                    {p.featured && <Badge tone="brand">Nổi bật</Badge>} {p.pinned && <Badge tone="accent">Ghim</Badge>}{" "}
                    <span className="ml-1">{p.title}</span>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500">{categoryName(p.categoryId)}</td>
                  <td className="px-5 py-2.5">
                    <Badge tone={p.status === "PUBLISHED" ? "accent" : "neutral"}>
                      {p.status === "PUBLISHED" ? "Đã đăng" : "Bản nháp"}
                    </Badge>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500 tabular-nums">{p.viewCount}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{formatDate(p.updatedAt)}</td>
                  <td className="px-5 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/admin/bai-viet/${p.id}`} className="text-xs font-medium text-brand-600 hover:underline">
                        Sửa
                      </Link>
                      <button onClick={() => togglePublish(p)} className="text-xs font-medium text-neutral-600 hover:underline">
                        {p.status === "PUBLISHED" ? "Gỡ đăng" : "Đăng"}
                      </button>
                      <button onClick={() => setToDelete(p)} className="text-xs font-medium text-urgent-600 hover:underline">
                        Xoá
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá bài viết "${toDelete?.title}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
