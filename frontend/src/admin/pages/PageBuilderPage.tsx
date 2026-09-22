import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi, ApiError, type PageBlockRequest } from "../api";
import type { Category } from "../../lib/types";
import type { DataTableColumn, PageBlockType, PageBlockView } from "../types";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  ErrorBanner,
  Field,
  LoadingState,
  PageHeader,
  Select,
  TextInput,
} from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { RichTextEditor } from "../components/RichTextEditor";
import { DataTableBlockEditor } from "../components/DataTableBlockEditor";

const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  RICH_TEXT: "Văn bản",
  POST_LIST: "Danh sách tin tức",
  DATA_TABLE: "Bảng dữ liệu tra cứu",
  STAFF_LIST: "Danh sách nhân sự",
};

interface BlockFormState {
  title: string;
  html: string;
  postCategoryId: number | null;
  limit: number;
  groupFilterEnabled: boolean;
  groupLabel: string;
  columns: DataTableColumn[];
  detailEnabled: boolean;
  detailButton: string;
  detailTitle: string;
}

function emptyForm(): BlockFormState {
  return { title: "", html: "", postCategoryId: null, limit: 6, groupFilterEnabled: false, groupLabel: "", columns: [], detailEnabled: false, detailButton: "Xem chi tiết", detailTitle: "Chi tiết" };
}

function formFromBlock(block: PageBlockView): BlockFormState {
  const base = emptyForm();
  base.title = block.title ?? "";
  if (block.type === "RICH_TEXT") base.html = (block.config.html as string) ?? "";
  if (block.type === "POST_LIST") {
    base.postCategoryId = (block.config.categoryId as number) ?? null;
    base.limit = (block.config.limit as number) ?? 6;
  }
  if (block.type === "DATA_TABLE") {
    base.groupFilterEnabled = !!block.config.groupLabel;
    base.groupLabel = (block.config.groupLabel as string) ?? "";
    base.columns = (block.config.columns as DataTableColumn[]) ?? [];
    const d = block.config.detail as { enabled?: boolean; buttonLabel?: string; title?: string } | undefined;
    if (d) {
      base.detailEnabled = !!d.enabled;
      base.detailButton = d.buttonLabel ?? base.detailButton;
      base.detailTitle = d.title ?? base.detailTitle;
    }
  }
  return base;
}

export function PageBuilderPage() {
  const { categoryId = "" } = useParams();
  const id = Number(categoryId);

  const [category, setCategory] = useState<Category | null>(null);
  const [blocks, setBlocks] = useState<PageBlockView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PageBlockView | null>(null);
  const [addType, setAddType] = useState<PageBlockType>("RICH_TEXT");
  const [form, setForm] = useState<BlockFormState>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<PageBlockView | null>(null);
  const [postCategories, setPostCategories] = useState<Category[]>([]);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([adminApi.categories.list("PAGE"), adminApi.pages.blocks.list(id)])
      .then(([categories, blockList]) => {
        setCategory(categories.find((c) => c.id === id) ?? null);
        setBlocks(blockList);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Không thể tải nội dung trang."))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);
  useEffect(() => {
    adminApi.categories.list("POST").then(setPostCategories).catch(() => undefined);
  }, []);

  function openCreate() {
    setEditing(null);
    setAddType("RICH_TEXT");
    setForm(emptyForm());
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(block: PageBlockView) {
    setEditing(block);
    setAddType(block.type);
    setForm(formFromBlock(block));
    setFormError(null);
    setDrawerOpen(true);
  }

  function buildConfig(type: PageBlockType, f: BlockFormState, existing?: PageBlockView): Record<string, unknown> {
    if (type === "RICH_TEXT") return { html: f.html };
    if (type === "POST_LIST") return { categoryId: f.postCategoryId, limit: f.limit };
    if (type === "DATA_TABLE") {
      return {
        groupLabel: f.groupFilterEnabled ? f.groupLabel.trim() || "Nhóm" : null,
        columns: f.columns,
        groups: existing?.config.groups ?? [],
        detail: {
          enabled: f.detailEnabled,
          buttonLabel: f.detailButton.trim() || "Xem chi tiết",
          title: f.detailTitle.trim() || "Chi tiết",
          columns: (existing?.config.detail as { columns?: unknown } | undefined)?.columns ?? [],
        },
      };
    }
    return {};
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    const request: PageBlockRequest = {
      type: addType,
      title: form.title.trim() || null,
      config: buildConfig(addType, form, editing ?? undefined),
    };
    try {
      if (editing) {
        await adminApi.pages.blocks.update(editing.id, request);
      } else {
        await adminApi.pages.blocks.create(id, request);
      }
      setDrawerOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu khối nội dung thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.pages.blocks.remove(toDelete.id);
      setToDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá khối nội dung thất bại.");
      setToDelete(null);
    }
  }

  async function handleMove(block: PageBlockView, direction: "UP" | "DOWN") {
    try {
      await adminApi.pages.blocks.move(block.id, direction);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sắp xếp khối thất bại.");
    }
  }

  function handleBlockChanged(updated: PageBlockView) {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  if (loading) return <LoadingState />;

  if (!category) {
    return (
      <div>
        <ErrorBanner message="Không tìm thấy trang con này." />
        <Link to="/admin/danh-muc" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
          ← Về danh sách trang con
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Nội dung: ${category.name}`}
        description={`Slug: /${category.slug} — quản lý các khối nội dung hiển thị trên trang con này.`}
        actions={
          <div className="flex gap-2">
            <Link to="/admin/danh-muc">
              <Button size="sm" variant="secondary">
                ← Trang con
              </Button>
            </Link>
            <Button size="sm" onClick={openCreate}>
              + Thêm khối
            </Button>
          </div>
        }
      />

      {error && <ErrorBanner message={error} />}

      {blocks.length === 0 && (
        <EmptyState title="Trang chưa có khối nội dung nào" description="Bấm “+ Thêm khối” để thêm văn bản, danh sách tin, bảng tra cứu, hoặc danh sách nhân sự." />
      )}

      <div className="space-y-4">
        {blocks.map((block, i) => (
          <Card key={block.id} className="p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone="brand">{BLOCK_TYPE_LABELS[block.type]}</Badge>
                <span className="text-sm font-medium text-neutral-900">{block.title || "(không có tiêu đề)"}</span>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => void handleMove(block, "UP")}
                  disabled={i === 0}
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                  title="Lên"
                >
                  ↑
                </button>
                <button
                  onClick={() => void handleMove(block, "DOWN")}
                  disabled={i === blocks.length - 1}
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30"
                  title="Xuống"
                >
                  ↓
                </button>
                <Button size="sm" variant="secondary" onClick={() => openEdit(block)}>
                  Sửa
                </Button>
                <Button size="sm" variant="danger" onClick={() => setToDelete(block)}>
                  Xoá
                </Button>
              </div>
            </div>

            {block.type === "DATA_TABLE" && <DataTableBlockEditor block={block} onBlockChanged={handleBlockChanged} />}
            {block.type === "RICH_TEXT" && (
              <div className="prose-content text-sm text-neutral-600" dangerouslySetInnerHTML={{ __html: (block.config.html as string) || "<p class='text-neutral-400'>(trống)</p>" }} />
            )}
            {block.type === "POST_LIST" && (
              <p className="text-sm text-neutral-500">
                Hiển thị {(block.config.limit as number) ?? 6} tin mới nhất từ danh mục{" "}
                {postCategories.find((c) => c.id === block.config.categoryId)?.name ?? `#${block.config.categoryId}`}.
              </p>
            )}
            {block.type === "STAFF_LIST" && <p className="text-sm text-neutral-500">Tự động hiển thị toàn bộ nhân sự đang hoạt động.</p>}
          </Card>
        ))}
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa khối nội dung" : "Thêm khối nội dung"}>
        <div className="space-y-4">
          <Field label="Loại khối" required>
            <Select value={addType} onChange={(e) => setAddType(e.target.value as PageBlockType)} disabled={!!editing}>
              <option value="RICH_TEXT">Văn bản</option>
              <option value="POST_LIST">Danh sách tin tức</option>
              <option value="DATA_TABLE">Bảng dữ liệu tra cứu</option>
              <option value="STAFF_LIST">Danh sách nhân sự</option>
            </Select>
          </Field>

          <Field label="Tiêu đề khối" hint="Hiển thị phía trên khối trên trang, để trống nếu không cần.">
            <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>

          {addType === "RICH_TEXT" && (
            <Field label="Nội dung">
              <RichTextEditor value={form.html} onChange={(html) => setForm({ ...form, html })} uploadFolder="page-content" />
            </Field>
          )}

          {addType === "POST_LIST" && (
            <>
              <Field label="Danh mục tin bài" required>
                <Select
                  value={form.postCategoryId ?? ""}
                  onChange={(e) => setForm({ ...form, postCategoryId: e.target.value ? Number(e.target.value) : null })}
                >
                  <option value="">— Chọn danh mục —</option>
                  {postCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Số tin hiển thị">
                <TextInput type="number" min={1} value={form.limit} onChange={(e) => setForm({ ...form, limit: Number(e.target.value) })} />
              </Field>
            </>
          )}

          {addType === "DATA_TABLE" && (
            <>
              <Checkbox
                label="Lọc dữ liệu theo nhóm (vd: chọn ngành trước khi xem bảng)"
                checked={form.groupFilterEnabled}
                onChange={(e) => setForm({ ...form, groupFilterEnabled: e.target.checked })}
              />
              {form.groupFilterEnabled && (
                <Field label="Tên bộ lọc" hint="Ví dụ: Ngành đào tạo, Loại hồ sơ…">
                  <TextInput value={form.groupLabel} onChange={(e) => setForm({ ...form, groupLabel: e.target.value })} />
                </Field>
              )}
              <Checkbox
                label="Mỗi dòng có danh sách chi tiết riêng (vd: ngành đào tạo → danh sách học phần)"
                checked={form.detailEnabled}
                onChange={(e) => setForm({ ...form, detailEnabled: e.target.checked })}
              />
              {form.detailEnabled && (
                <>
                  <Field label="Nhãn nút ở mỗi dòng" hint="Ví dụ: Tìm học phần">
                    <TextInput value={form.detailButton} onChange={(e) => setForm({ ...form, detailButton: e.target.value })} />
                  </Field>
                  <Field label="Tiêu đề bảng chi tiết" hint="Ví dụ: Danh sách học phần">
                    <TextInput value={form.detailTitle} onChange={(e) => setForm({ ...form, detailTitle: e.target.value })} />
                  </Field>
                </>
              )}
              <p className="text-xs text-neutral-400">
                Cột dữ liệu và các dòng được quản lý sau khi lưu khối — mở lại khối này trong danh sách bên dưới để chỉnh sửa.
              </p>
            </>
          )}

          {addType === "STAFF_LIST" && (
            <p className="text-sm text-neutral-500">Khối này tự động hiển thị toàn bộ nhân sự đang hoạt động, không cần cấu hình thêm.</p>
          )}

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá khối "${toDelete ? BLOCK_TYPE_LABELS[toDelete.type] : ""}"?`}
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
