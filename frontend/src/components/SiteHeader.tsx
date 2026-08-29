import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCategories } from "../lib/useCategories";
import { buildCategoryTree } from "../lib/categoryTree";
import { CategoryNav } from "./CategoryNav";
import { SearchBox } from "./SearchBox";

const MOBILE_LINKS = [
  { to: "/bieu-mau", label: "Biểu mẫu" },
  { to: "/thong-bao", label: "Thông báo" },
  { to: "/cong-khai", label: "Công khai" },
  { to: "/gui-van-ban", label: "Gửi văn bản" },
];

export function SiteHeader() {
  const { categories } = useCategories("POST");
  const { categories: pageCategories } = useCategories("PAGE");
  const postTree = buildCategoryTree(categories);
  const pageTree = buildCategoryTree(pageCategories, (node, ancestorSlugs) => `/trang/${[...ancestorSlugs, node.slug].join("/")}`);
  const tree = [...postTree, ...pageTree];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header>
      <div className="bg-brand-900 text-brand-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-xs">
          <span>Trường Đại học Kiên Giang</span>
          <a href="mailto:pqtcsvc@vnkgu.edu.vn" className="hover:text-white hover:underline">
            pqtcsvc@vnkgu.edu.vn
          </a>
        </div>
      </div>

      <div className="relative z-10 border-b border-neutral-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="group flex items-center gap-3">
            <img
                src="/logo.ico"
                alt="Logo"
                className="h-11 w-11 p-1.5 flex-shrink-0 rounded-full bg-white shadow-sm transition-transform group-hover:scale-105 object-contain"
            />
            <span className="leading-tight">
              <span className="block text-base font-bold text-neutral-900 sm:text-lg">
                Phòng Quản trị Cơ sở vật chất
              </span>
              <span className="block text-xs text-neutral-500 sm:text-sm">
                Trường Đại học Kiên Giang
              </span>
            </span>
          </Link>

          <div className="ml-auto hidden md:block">
            <SearchBox variant="header" />
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileOpen ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <nav aria-label="Điều hướng chính" className="hidden bg-brand-600 md:block">
        <div className="mx-auto max-w-6xl px-2">
          <CategoryNav categories={tree} />
        </div>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-b border-neutral-200 bg-white md:hidden">
          <div className="px-4 py-3">
            <SearchBox variant="header" />
          </div>
          <nav aria-label="Điều hướng (di động)" className="flex flex-col border-t border-neutral-100 py-2">
            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 text-sm font-medium ${isActive ? "text-brand-700" : "text-neutral-700"}`
              }
            >
              Trang chủ
            </NavLink>
            {tree.map((node) => (
              <div key={`${node.kind}-${node.id}`}>
                <NavLink
                  to={node.href}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-sm font-medium ${isActive ? "text-brand-700" : "text-neutral-700"}`
                  }
                >
                  {node.name}
                </NavLink>
                {node.children.length > 0 && (
                  <div className="flex flex-col border-l border-neutral-200 pl-3">
                    {node.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.href}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `px-4 py-2 text-sm ${isActive ? "text-brand-700" : "text-neutral-600"}`
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {MOBILE_LINKS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-sm font-medium ${isActive ? "text-brand-700" : "text-neutral-700"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
