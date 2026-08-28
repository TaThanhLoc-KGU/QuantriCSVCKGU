import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi, ApiError, type PostRequest } from "../api";
import type { Category } from "../../lib/types";
import { Button, Card, Checkbox, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Textarea } from "../components/ui";
import { RichTextEditor } from "../components/RichTextEditor";
import { ImageDropzone } from "../components/ImageDropzone";

interface FormState {
  title: string;
  summary: string;
  content: string;
  thumbnailUrl: string;
  categoryId: number | null;
  featured: boolean;
  pinned: boolean;
}

const emptyForm: FormState = { title: "", summary: "", content: "", thumbnailUrl: "", categoryId: null, featured: false, pinned: false };

export function PostEditPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.categories.list("POST").then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    adminApi.posts
      .list({})
      .then((posts) => {
        const post = posts.find((p) => p.id === Number(id));
        if (!post) {
          setError("Không tìm thấy bài viết.");
          return;
        }
        setForm({
          title: post.title,
          summary: post.summary ?? "",
          content: post.content ?? "",
          thumbnailUrl: post.thumbnailUrl ?? "",
          categoryId: post.categoryId,
          featured: post.featured,
          pinned: post.pinned,
        });
        setStatus(post.status);
      })
      .catch(() => setError("Không thể tải bài viết."))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSave(publish: boolean | undefined) {
    if (!form.categoryId) {
      setError("Vui lòng chọn danh mục.");
      return;
    }
    setSaving(true);
    setError(null);
    const body: PostRequest = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      thumbnailUrl: form.thumbnailUrl,
      categoryId: form.categoryId,
      featured: form.featured,
      pinned: form.pinned,
      publish,
    };
    try {
      if (isNew) {
        const created = await adminApi.posts.create(body);
        navigate(`/admin/bai-viet/${created.id}`, { replace: true });
      } else {
        await adminApi.posts.update(Number(id), body);
        navigate("/admin/bai-viet");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu bài viết thất bại.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-3xl">
      <PageHeader title={isNew ? "Viết bài mới" : "Sửa bài viết"} description={!isNew ? `Trạng thái hiện tại: ${status === "PUBLISHED" ? "Đã đăng" : "Bản nháp"}` : undefined} />

      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <Card className="space-y-4 p-5">
        <Field label="Tiêu đề" required>
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>

        <Field label="Danh mục" required>
          <Select value={form.categoryId ?? ""} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
            <option value="">— Chọn danh mục —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tóm tắt" hint="Hiển thị ở danh sách và thẻ bài viết.">
          <Textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
        </Field>

        <Field label="Ảnh đại diện" hint="Hiển thị ở thẻ bài viết và đầu trang chi tiết.">
          <ImageDropzone
            value={form.thumbnailUrl || null}
            onChange={(url) => setForm((f) => ({ ...f, thumbnailUrl: url }))}
            folder="posts"
            aspectClassName="aspect-[16/9] max-w-sm"
          />
        </Field>

        <Field label="Nội dung" required>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
            placeholder="Nhập nội dung bài viết…"
            uploadFolder="posts"
          />
        </Field>

        <div className="flex gap-6">
          <Checkbox label="Tin nổi bật" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
          <Checkbox label="Ghim đầu danh sách" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />
        </div>
      </Card>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => navigate("/admin/bai-viet")}>
          Huỷ
        </Button>
        <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving || !form.title.trim()}>
          Lưu nháp
        </Button>
        <Button onClick={() => handleSave(true)} disabled={saving || !form.title.trim()}>
          {saving ? "Đang lưu…" : "Lưu & đăng"}
        </Button>
      </div>
    </div>
  );
}
