import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../AuthContext";
import { NotificationBell } from "../components/NotificationBell";
import { useSiteInfo } from "../../lib/useSiteInfo";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function useNavGroups(): NavGroup[] {
  const { user } = useAuth();
  const isEditorOrAdmin = user?.role === "EDITOR" || user?.role === "ADMIN";
  const isAdmin = user?.role === "ADMIN";

  const groups: NavGroup[] = [
    { label: "", items: [{ to: "/admin", label: "Tổng quan", end: true }] },
    {
      label: "Nội dung",
      items: [
        { to: "/admin/bai-viet", label: "Bài viết" },
        ...(isEditorOrAdmin ? [{ to: "/admin/danh-muc", label: "Danh mục & trang con" }] : []),
        ...(isEditorOrAdmin ? [{ to: "/admin/banner", label: "Banner" }] : []),
        ...(isEditorOrAdmin ? [{ to: "/admin/thu-vien", label: "Thư viện ảnh/video" }] : []),
        ...(isEditorOrAdmin ? [{ to: "/admin/cong-cu", label: "Chức năng tự tạo" }] : []),
        { to: "/admin/bieu-mau", label: "Biểu mẫu" },
        { to: "/admin/thong-bao", label: "Thông báo" },
      ],
    },
    {
      label: "Sổ văn bản",
      items: [
        { to: "/admin/van-ban", label: "Sổ văn bản" },
        ...(isAdmin ? [{ to: "/admin/loai-van-ban", label: "Loại văn bản" }] : []),
        { to: "/admin/doi-chieu-cong-van", label: "Đối chiếu Công văn" },
      ],
    },
    { label: "Công việc", items: [{ to: "/admin/nhiem-vu", label: "Nhiệm vụ" }] },
    {
      label: "Hỗ trợ sinh viên",
      items: [
        { to: "/admin/khoi-phuc-tai-khoan", label: "Khôi phục tài khoản" },
        { to: "/admin/danh-ba-email", label: "Danh bạ email" },
        { to: "/admin/gop-y", label: "Hòm thư góp ý" },
      ],
    },
    { label: "Báo cáo", items: [{ to: "/admin/bao-cao", label: "Báo cáo định kỳ" }] },
  ];

  if (isAdmin) {
    groups.push({
      label: "Hệ thống",
      items: [
        { to: "/admin/nguoi-dung", label: "Người dùng" },
        { to: "/admin/nhan-su", label: "Nhân sự" },
        { to: "/admin/cau-hinh", label: "Giao diện & cấu hình" },
      ],
    });
  }

  return groups;
}

const roleLabels: Record<string, string> = { ADMIN: "Quản trị viên", EDITOR: "Biên tập viên", STAFF: "Nhân viên" };

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const groups = useNavGroups();
  const site = useSiteInfo();

  return (
    <div className="flex h-full flex-col bg-neutral-900 text-neutral-300">
      <div className="flex items-center gap-2.5 border-b border-neutral-700 px-4 py-3.5">
        <img src={site.logoUrl} alt="" className="h-9 w-9 flex-shrink-0 bg-white object-contain p-0.5" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-extrabold uppercase text-white">{site.name}</p>
          <p className="truncate text-[11px] text-neutral-400">Trang quản trị</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((group) => (
          <div key={group.label || "root"} className="mb-1">
            {group.label && <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-500">{group.label}</p>}
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    "block border-l-[3px] px-4 py-1.5 text-[13px] font-medium transition-colors",
                    isActive ? "border-accent-400 bg-white/10 text-white" : "border-transparent hover:bg-white/5 hover:text-white",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <a href="/" className="border-t border-neutral-700 px-4 py-3 text-xs font-semibold text-neutral-400 hover:text-white">
        ← Xem trang công khai
      </a>
    </div>
  );
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [drawer, setDrawer] = useState(false);
  useLocation();

  return (
    <div className="admin-shell flex min-h-screen bg-neutral-100">
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 md:block">
        <Sidebar />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button aria-label="Đóng menu" className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-300 bg-white px-4 py-2 md:px-6">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Mở menu"
            className="flex h-9 w-9 items-center justify-center border border-neutral-300 text-neutral-700 md:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <div className="h-6 w-px bg-neutral-300" />
            <div className="text-right leading-tight">
              <p className="text-[13px] font-bold text-neutral-900">{user?.fullName}</p>
              <p className="text-[11px] text-neutral-500">{user ? roleLabels[user.role] : ""}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:border-neutral-500 hover:bg-neutral-50"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
