import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export interface HeroBreadcrumbItem {
  label: string;
  to?: string;
}

interface PageHeroProps {
  icon: ReactNode;
  title: string;
  description?: string;
  breadcrumb: HeroBreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHero({ icon, title, description, breadcrumb, actions }: PageHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700">
      <div className="blueprint-grid absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-brand-200">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="transition-colors hover:text-white">
                Trang chủ
              </Link>
            </li>
            {breadcrumb.map((item, idx) => (
              <li key={idx} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-brand-400">/</span>
                {item.to ? (
                  <Link to={item.to} className="transition-colors hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15"
            >
              {icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
              {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-brand-200 sm:text-base">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex-shrink-0">{actions}</div>}
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-600" aria-hidden="true" />
    </div>
  );
}
