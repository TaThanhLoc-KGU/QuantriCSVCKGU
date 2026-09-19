import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export interface HeroBreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeroProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  breadcrumb: HeroBreadcrumbItem[];
  actions?: ReactNode;
}

/** Đầu trang con: vệt đường dẫn + tiêu đề trên nền sáng, vạch dưới màu thương hiệu (không dải màu lớn chiếm chỗ). */
export function PageHero({ title, description, breadcrumb, actions }: PageHeroProps) {
  return (
    <div className="border-b-2 border-brand-700 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 py-4">
        <nav aria-label="Breadcrumb" className="text-xs text-neutral-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-brand-700 hover:underline">
                Trang chủ
              </Link>
            </li>
            {breadcrumb.map((item, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                {item.to ? (
                  <Link to={item.to} className="hover:text-brand-700 hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-neutral-800" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-balance text-2xl font-extrabold text-brand-800 sm:text-[28px]">{title}</h1>
            {description && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-neutral-600">{description}</p>}
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
