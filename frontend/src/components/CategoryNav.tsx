import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTools } from "../lib/useTools";
interface NavEntry {
  id: number | string;
  name: string;
  href: string;
  children: NavEntry[];
}

const cell =
  "relative flex items-center gap-1 whitespace-nowrap border-r border-white/15 px-3.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/15";
const cellActive = "bg-white/20 after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-accent-400";

function CategoryNavItem({ node }: { node: NavEntry }) {
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
    <li className="relative" onMouseEnter={hasChildren ? openMenu : undefined} onMouseLeave={hasChildren ? scheduleClose : undefined}>
      <NavLink
        to={node.href}
        className={({ isActive }) => `${cell} ${isActive ? cellActive : ""}`}
        aria-haspopup={hasChildren ? "true" : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onFocus={hasChildren ? openMenu : undefined}
      >
        {node.name}
        {hasChildren && (
          <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3">
            <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </NavLink>
      {hasChildren && open && (
        <ul
          className="absolute left-0 top-full z-30 min-w-60 divide-y divide-neutral-200 border border-neutral-300 border-t-0 bg-white shadow-[0_8px_16px_-6px_rgba(0,0,0,0.25)]"
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
        >
          {node.children.map((child) => (
            <li key={child.id}>
              <NavLink
                to={child.href}
                className={({ isActive }) =>
                  `block px-4 py-2.5 text-[13px] transition-colors hover:bg-brand-50 hover:text-brand-800 ${
                    isActive ? "bg-brand-50 font-bold text-brand-800" : "text-neutral-700"
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

const FIXED_ITEMS = [
  { to: "/bieu-mau", label: "Biểu mẫu" },
  { to: "/thong-bao", label: "Thông báo" },
  { to: "/cong-khai", label: "Công khai" },
];

const SERVICES: NavEntry = {
  id: "services",
  name: "Dịch vụ",
  href: "/gui-van-ban",
  children: [
    { id: "s1", name: "Gửi văn bản", href: "/gui-van-ban", children: [] },
    { id: "s2", name: "Khôi phục tài khoản", href: "/khoi-phuc-tai-khoan", children: [] },
    { id: "s3", name: "Tra cứu kết quả xử lý", href: "/tra-cuu-ket-qua", children: [] },
    { id: "s4", name: "Tra cứu email sinh viên", href: "/tra-cuu-email", children: [] },
    { id: "s5", name: "Hòm thư góp ý", href: "/hom-thu-gop-y", children: [] },
  ],
};

export function CategoryNav({ categories, className }: { categories: NavEntry[]; className?: string }) {
  const tools = useTools();
  const services: NavEntry = {
    ...SERVICES,
    children: [...SERVICES.children, ...tools.map((t) => ({ id: `tool-${t.slug}`, name: t.name, href: `/cong-cu/${t.slug}`, children: [] }))],
  };
  return (
    <ul className={`flex flex-wrap items-stretch border-l border-white/15 ${className ?? ""}`}>
      <li>
        <NavLink to="/" end className={({ isActive }) => `${cell} ${isActive ? cellActive : ""}`}>
          Trang chủ
        </NavLink>
      </li>
      {categories.map((node) => (
        <CategoryNavItem key={node.id} node={node} />
      ))}
      {FIXED_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink to={item.to} className={({ isActive }) => `${cell} ${isActive ? cellActive : ""}`}>
            {item.label}
          </NavLink>
        </li>
      ))}
      <CategoryNavItem node={services} />
    </ul>
  );
}
