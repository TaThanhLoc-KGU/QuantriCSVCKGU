import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Form } from "../lib/types";
import { useCategories } from "../lib/useCategories";
import { PageHero } from "../components/PageHero";
import { DocumentStackIcon } from "../components/icons";
import { LoadingState, ErrorState, EmptyState } from "../components/states";
import { formatDate, formatNumber } from "../lib/format";

export function FormsPage() {
  const { categories } = useCategories("FORM");
  const [query, setQuery] = useState("");
  const [forms, setForms] = useState<Form[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      api
        .forms({ q: query || undefined })
        .then((list) => {
          if (!cancelled) setForms(list);
        })
        .catch(() => {
          if (!cancelled) setError("Không tải được danh sách biểu mẫu.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const grouped = new Map<number, Form[]>();
  const ungrouped: Form[] = [];
  for (const form of forms ?? []) {
    if (categories.some((c) => c.id === form.categoryId)) {
      const list = grouped.get(form.categoryId) ?? [];
      list.push(form);
      grouped.set(form.categoryId, list);
    } else {
      ungrouped.push(form);
    }
  }

  return (
    <div>
      <PageHero
        icon={<DocumentStackIcon className="h-6 w-6" />}
        title="Biểu mẫu"
        description="Tải các biểu mẫu dùng chung của Phòng Quản trị Cơ sở vật chất."
        breadcrumb={[{ label: "Biểu mẫu" }]}
        actions={
          <div className="relative w-full sm:w-72">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm biểu mẫu theo tên…"
              className="w-full rounded-md border-0 bg-white/95 py-2.5 pl-3 pr-9 text-sm text-neutral-900 shadow-sm outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-white/70"
            />
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="m17 17-3.5-3.5" strokeLinecap="round" />
            </svg>
          </div>
        }
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        {loading && !forms ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : (forms ?? []).length === 0 ? (
          <EmptyState message={query ? `Không tìm thấy biểu mẫu nào khớp "${query}".` : "Chưa có biểu mẫu nào."} />
        ) : (
          <div className="animate-fade-up space-y-8">
            {categories
              .filter((c) => grouped.has(c.id))
              .map((category) => (
                <section key={category.id}>
                  <h2 className="mb-3 text-base font-bold text-neutral-800">{category.name}</h2>
                  <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                    {grouped.get(category.id)!.map((form) => (
                      <FormRow key={form.id} form={form} />
                    ))}
                  </ul>
                </section>
              ))}
            {ungrouped.length > 0 && (
              <section>
                <h2 className="mb-3 text-base font-bold text-neutral-800">Khác</h2>
                <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                  {ungrouped.map((form) => (
                    <FormRow key={form.id} form={form} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function FormRow({ form }: { form: Form }) {
  return (
    <li className="flex flex-col gap-3 p-4 transition-colors hover:bg-brand-50/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M6 2.5h5.5L15 6v10.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
            <path d="M11.5 2.5V6H15" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="font-medium text-neutral-900">{form.title}</p>
          {form.description && <p className="mt-0.5 text-sm text-neutral-500">{form.description}</p>}
          <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-neutral-400">
            {form.version && <span>Phiên bản {form.version}</span>}
            <span>Cập nhật {formatDate(form.updatedAt)}</span>
            <span>{formatNumber(form.downloadCount)} lượt tải</span>
          </p>
        </div>
      </div>
      <a
        href={`/api/public/forms/${form.id}/download`}
        className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-md"
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 16.5h12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Tải về
      </a>
    </li>
  );
}
