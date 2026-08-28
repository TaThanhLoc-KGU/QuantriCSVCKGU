import { useEffect, useState } from "react";
import { api } from "./api";
import type { Category, CategoryKind } from "./types";

const cache = new Map<CategoryKind, Category[]>();
const inFlight = new Map<CategoryKind, Promise<Category[]>>();

function loadCategories(kind: CategoryKind): Promise<Category[]> {
  const cached = cache.get(kind);
  if (cached) return Promise.resolve(cached);

  let pending = inFlight.get(kind);
  if (!pending) {
    pending = api.categories(kind).then((list) => {
      cache.set(kind, list);
      inFlight.delete(kind);
      return list;
    });
    inFlight.set(kind, pending);
  }
  return pending;
}

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/** Danh sach danh muc theo kind, cache trong phien lam viec de menu khong goi lai API o moi trang. */
export function useCategories(kind: CategoryKind = "POST"): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>(() => cache.get(kind) ?? []);
  const [loading, setLoading] = useState(() => !cache.has(kind));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(kind)) {
      setCategories(cache.get(kind)!);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    loadCategories(kind)
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {
        if (!cancelled) setError("Không tải được danh mục");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return { categories, loading, error };
}
