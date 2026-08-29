import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../AuthContext";
import { NotificationBell } from "../components/NotificationBell";

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
        ...(isEditorOrAdmin ? [{ to: "/admin/danh-muc", label: "Danh mục" }] : []),
        ...(isEditorOrAdmin ? [{ to: "/admin/banner", label: "Banner" }] : []),
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
    { label: "Hỗ trợ sinh viên", items: [{ to: "/admin/khoi-phuc-tai-khoan", label: "Khôi phục tài khoản" }] },
    { label: "Báo cáo", items: [{ to: "/admin/bao-cao", label: "Báo cáo định kỳ" }] },
  ];

  if (isAdmin) {
    groups.push({
      label: "Hệ thống",
      items: [
        { to: "/admin/nguoi-dung", label: "Người dùng" },
        { to: "/admin/nhan-su", label: "Nhân sự" },
        { to: "/admin/cau-hinh", label: "Cấu hình" },
      ],
    });
  }

  return groups;
}

const roleLabels: Record<string, string> = { ADMIN: "Quản trị viên", EDITOR: "Biên tập viên", STAFF: "Nhân viên" };

export function AdminLayout() {
  const { user, logout } = useAuth();
  const groups = useNavGroups();

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            QT
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900">Quản trị QTCSVC</p>
            <p className="truncate text-xs text-neutral-500">Trường Đại học Kiên Giang</p>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.label || "root"}>
              {group.label && (
                <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">{group.label}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      clsx(
                        "block rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive ? "bg-brand-50 text-brand-700" : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:px-6">
          <a href="/" className="text-xs font-medium text-brand-600 hover:underline">
            ← Về trang công khai
          </a>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-6 w-px bg-neutral-200" />
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900">{user?.fullName}</p>
              <p className="text-xs text-neutral-500">{user ? roleLabels[user.role] : ""}</p>
            </div>
            <button
              onClick={() => void logout()}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
