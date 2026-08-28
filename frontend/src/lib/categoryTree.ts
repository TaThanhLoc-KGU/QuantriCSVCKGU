import type { Category } from "./types";

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

/** Chuyen danh sach phang (parentId) thanh cay, sap theo sortOrder. */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodeById = new Map<number, CategoryNode>();
  for (const c of categories) {
    nodeById.set(c.id, { ...c, children: [] });
  }

  const roots: CategoryNode[] = [];
  for (const node of nodeById.values()) {
    if (node.parentId !== null && nodeById.has(node.parentId)) {
      nodeById.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const bySortOrder = (a: Category, b: Category) => a.sortOrder - b.sortOrder;
  const sortRecursive = (nodes: CategoryNode[]) => {
    nodes.sort(bySortOrder);
    nodes.forEach((n) => sortRecursive(n.children));
  };
  sortRecursive(roots);

  return roots;
}

export function findCategoryBySlug(categories: Category[], slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/** Duong dan breadcrumb tu goc den danh muc chi dinh. */
export function categoryPath(categories: Category[], categoryId: number): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const path: Category[] = [];
  let current = byId.get(categoryId);
  while (current) {
    path.unshift(current);
    current = current.parentId !== null ? byId.get(current.parentId) : undefined;
  }
  return path;
}
