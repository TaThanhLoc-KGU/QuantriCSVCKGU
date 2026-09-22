import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/useCategories";
import { buildCategoryTree } from "../lib/categoryTree";
import { useSiteInfo } from "../lib/useSiteInfo";
import { parseLinks } from "../lib/theme";
import { formatDate } from "../lib/format";
import { CategoryNav } from "./CategoryNav";
import { SearchBox } from "./SearchBox";

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

const MOBILE_LINKS = [
  { to: "/bieu-mau", label: "Biểu mẫu" },
  { to: "/thong-bao", label: "Thông báo" },
  { to: "/cong-khai", label: "Công khai" },
  { to: "/gui-van-ban", label: "Gửi văn bản" },
  { to: "/tra-cuu-email", label: "Tra cứu email SV" },
  { to: "/hom-thu-gop-y", label: "Hòm thư góp ý" },
];

function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

export function SiteHeader() {
  const site = useSiteInfo();
  const { categories } = useCategories("POST");
  const { categories: pageCategories } = useCategories("PAGE");
  const postTree = buildCategoryTree(categories);
  const pageTree = buildCategoryTree(pageCategories, (node, ancestorSlugs) => `/trang/${[...ancestorSlugs, node.slug].join("/")}`);
  const tree = [...postTree, ...pageTree];
  const [mobileOpen, setMobileOpen] = useState(false);

  const now = new Date();
  const topLinks = parseLinks(site.topLinks);
  const links = topLinks.length > 0 ? topLinks : site.parentUrl ? [{ label: "Website Trường", url: site.parentUrl }] : [];

  return (
    <header>
      <div className="bg-neutral-900 text-neutral-300">
        <div className="mx-auto flex max-w-[1200px] items-stretch justify-between px-4 text-xs">
          <ul className="flex divide-x divide-neutral-700">
            {links.map((l) => (
              <li key={l.url + l.label}>
                {isExternal(l.url) ? (
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 first:pl-0 hover:text-white">
                    {l.label}
                  </a>
                ) : (
                  <Link to={l.url} className="block px-3 py-2 first:pl-0 hover:text-white">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p className="tnum hidden items-center py-2 sm:flex">
            {WEEKDAYS[now.getDay()]}, {formatDate(now.toISOString())}
          </p>
        </div>
      </div>

      <div className="border-b border-neutral-300 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3.5">
            <img src={site.logoUrl} alt="" className="h-14 w-14 flex-shrink-0 object-contain" />
            <span className="min-w-0 leading-tight">
              <span className="block text-xl font-extrabold text-brand-800 sm:text-2xl">{site.name}</span>
              <span className="mt-0.5 block text-sm text-neutral-500">{site.subtitle}</span>
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-5 md:flex">
            {site.phone && (
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="tnum text-right text-xs leading-tight text-neutral-500 hover:text-brand-700">
                Đường dây liên hệ
                <span className="block text-sm font-bold text-neutral-900">{site.phone}</span>
              </a>
            )}
            <SearchBox variant="header" />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-auto flex h-10 w-10 flex-shrink-0 items-center justify-center border border-neutral-300 text-neutral-700 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={mobileOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <nav aria-label="Điều hướng chính" className="masthead-nav hidden bg-brand-700 md:block">
        <div className="mx-auto max-w-[1200px] px-4">
          <CategoryNav categories={tree} />
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-b border-neutral-300 bg-white md:hidden">
          <div className="px-4 py-3">
            <SearchBox variant="header" />
          </div>
          <nav aria-label="Điều hướng (di động)" className="flex flex-col divide-y divide-neutral-200 border-t border-neutral-200">
            <NavLink to="/" end onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-neutral-800">
              Trang chủ
            </NavLink>
            {tree.map((node) => (
              <div key={`${node.kind}-${node.id}`}>
                <NavLink to={node.href} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-neutral-800">
                  {node.name}
                </NavLink>
                {node.children.map((child) => (
                  <NavLink
                    key={child.id}
                    to={child.href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-t border-neutral-100 bg-neutral-50 py-2 pl-8 pr-4 text-sm text-neutral-600"
                  >
                    {child.name}
                  </NavLink>
                ))}
              </div>
            ))}
            {MOBILE_LINKS.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-neutral-800">
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
