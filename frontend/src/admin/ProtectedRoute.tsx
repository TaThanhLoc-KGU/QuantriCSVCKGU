import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { Role } from "./types";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <p className="text-sm text-neutral-500">Đang tải…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/dang-nhap" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 text-center">
        <div>
          <p className="text-lg font-semibold text-neutral-900">Không đủ quyền truy cập</p>
          <p className="mt-1 text-sm text-neutral-500">Chức năng này chỉ dành cho quản trị viên.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
