import { useEffect, useMemo, useState, type ReactNode } from "react";
import { adminApi, ApiError, type CategoryRequest } from "../api";
import type { Category, CategoryKind } from "../../lib/types";
import { buildCategoryTree, type CategoryNode } from "../../lib/categoryTree";
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, LoadingState, PageHeader, Select, TextInput, Textarea } from "../components/ui";
import { Drawer } from "../components/Drawer";
import { ConfirmDialog } from "../components/ConfirmDialog";

const emptyForm = (kind: CategoryKind): CategoryRequest => ({ name: "", kind, parentId: null, sortOrder: 0, description: "" });

export function CategoriesPage() {
  const [kind, setKind] = useState<CategoryKind>("POST");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryRequest>(emptyForm(kind));
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);

  function load(k: CategoryKind) {
    setLoading(true);
    setError(null);
    adminApi.categories
      .list(k)
      .then(setCategories)
      .catch(() => setError("Không thể tải danh mục."))
      .finally(() => setLoading(false));
  }

  useEffect(() => load(kind), [kind]);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(kind));
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({ name: c.name, kind: c.kind, parentId: c.parentId, sortOrder: c.sortOrder, description: c.description ?? "" });
    setFormError(null);
    setDrawerOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        await adminApi.categories.update(editing.id, form);
      } else {
        await adminApi.categories.create(form);
      }
      setDrawerOpen(false);
      load(kind);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Lưu danh mục thất bại.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await adminApi.categories.remove(toDelete.id);
      setToDelete(null);
      load(kind);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xoá danh mục thất bại.");
      setToDelete(null);
    }
  }

  function renderRows(nodes: CategoryNode[], depth = 0): ReactNode[] {
    return nodes.flatMap((node) => [
      <tr key={node.id} className="border-b border-neutral-100 last:border-0">
        <td className="px-5 py-2.5 text-neutral-900">
          <span style={{ paddingLeft: depth * 20 }}>{depth > 0 && "— "}{node.name}</span>
        </td>
        <td className="px-5 py-2.5 text-neutral-500">{node.slug}</td>
        <td className="px-5 py-2.5 text-neutral-500">{node.sortOrder}</td>
        <td className="px-5 py-2.5">
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => openEdit(node)}>
              Sửa
            </Button>
            <Button size="sm" variant="danger" onClick={() => setToDelete(node)}>
              Xoá
            </Button>
          </div>
        </td>
      </tr>,
      ...renderRows(node.children, depth + 1),
    ]);
  }

  return (
    <div>
      <PageHeader
        title="Danh mục"
        description="Quản lý danh mục tin bài và biểu mẫu."
        actions={<Button onClick={openCreate}>+ Thêm danh mục</Button>}
      />

      <div className="mb-4 flex gap-2">
        <Button size="sm" variant={kind === "POST" ? "primary" : "secondary"} onClick={() => setKind("POST")}>
          Tin bài
        </Button>
        <Button size="sm" variant={kind === "FORM" ? "primary" : "secondary"} onClick={() => setKind("FORM")}>
          Biểu mẫu
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <LoadingState />}

      {!loading && tree.length === 0 && <EmptyState title="Chưa có danh mục nào" description="Bấm “Thêm danh mục” để tạo mới." />}

      {!loading && tree.length > 0 && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-2 font-medium">Tên</th>
                <th className="px-5 py-2 font-medium">Slug</th>
                <th className="px-5 py-2 font-medium">Thứ tự</th>
                <th className="px-5 py-2 font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>{renderRows(tree)}</tbody>
          </table>
        </Card>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "Sửa danh mục" : "Thêm danh mục"}>
        <div className="space-y-4">
          <Field label="Tên danh mục" required>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Danh mục cha" hint="Để trống nếu là danh mục gốc">
            <Select
              value={form.parentId ?? ""}
              onChange={(e) => setForm({ ...form, parentId: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">— Không có —</option>
              {categories
                .filter((c) => c.id !== editing?.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Thứ tự hiển thị">
            <TextInput
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <Field label="Mô tả">
            <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          {formError && <p className="text-sm text-urgent-600">{formError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
              {saving ? "Đang lưu…" : "Lưu"}
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!toDelete}
        title={`Xoá danh mục "${toDelete?.name}"?`}
        description="Bài viết/biểu mẫu thuộc danh mục này có thể bị ảnh hưởng."
        confirmLabel="Xoá"
        danger
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

export function KindBadge({ kind }: { kind: CategoryKind }) {
  return <Badge tone={kind === "POST" ? "brand" : "accent"}>{kind === "POST" ? "Tin bài" : "Biểu mẫu"}</Badge>;
}
