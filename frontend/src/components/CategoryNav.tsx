import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import type { CategoryNode } from "../lib/categoryTree";

interface CategoryNavItemProps {
  node: CategoryNode;
}

function CategoryNavItem({ node }: CategoryNavItemProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const hasChildren = node.children.length > 0;

  function openMenu() {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function scheduleClose() {
    closeTimer.current = window.setTimeout(() => setOpen(false), 150);
  }

  return (
    <li
      className="relative"
      onMouseEnter={hasChildren ? openMenu : undefined}
      onMouseLeave={hasChildren ? scheduleClose : undefined}
    >
      <NavLink
        to={node.href}
        className={({ isActive }) =>
          `relative flex items-center gap-1 whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors hover:bg-brand-700 hover:text-white ${
            isActive ? "bg-brand-800 text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent-400" : "text-brand-50"
          }`
        }
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onFocus={hasChildren ? openMenu : undefined}
      >
        {node.name}
        {hasChildren && (
          <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </NavLink>
      {hasChildren && open && (
        <ul
          className="absolute left-0 top-full z-30 min-w-56 border border-neutral-200 bg-white py-1 shadow-lg"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          {node.children.map((child) => (
            <li key={child.id}>
              <NavLink
                to={child.href}
                className={({ isActive }) =>
                  `block px-4 py-2 text-sm transition-colors hover:bg-brand-50 hover:text-brand-700 ${
                    isActive ? "font-semibold text-brand-700" : "text-neutral-700"
                  }`
                }
              >
                {child.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

interface CategoryNavProps {
  categories: CategoryNode[];
  className?: string;
}

const FIXED_ITEMS = [
  { to: "/bieu-mau", label: "Biểu mẫu" },
  { to: "/thong-bao", label: "Thông báo" },
  { to: "/cong-khai", label: "Công khai" },
  { to: "/gui-van-ban", label: "Gửi văn bản" },
];

export function CategoryNav({ categories, className }: CategoryNavProps) {
  return (
    <ul className={`flex items-stretch ${className ?? ""}`}>
      <li>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `relative flex items-center px-3 py-3 text-sm font-medium transition-colors hover:bg-brand-700 hover:text-white ${
              isActive ? "bg-brand-800 text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent-400" : "text-brand-50"
            }`
          }
        >
          Trang chủ
        </NavLink>
      </li>
      {categories.map((node) => (
        <CategoryNavItem key={node.id} node={node} />
      ))}
      {FIXED_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            className={({ isActive }) =>
              `relative flex items-center px-3 py-3 text-sm font-medium transition-colors hover:bg-brand-700 hover:text-white ${
                isActive ? "bg-brand-800 text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent-400" : "text-brand-50"
              }`
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
