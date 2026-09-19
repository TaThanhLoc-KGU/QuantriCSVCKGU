import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { PublicLayout } from "./layouts/PublicLayout";
import { HomePage } from "./pages/HomePage";
import { CategoryPage } from "./pages/CategoryPage";
import { SitePage } from "./pages/SitePage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { FormsPage } from "./pages/FormsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { DisclosuresPage } from "./pages/DisclosuresPage";
import { SubmitDocumentPage } from "./pages/SubmitDocumentPage";
import { AccountRecoveryPage } from "./pages/AccountRecoveryPage";
import { AccountRecoveryLookupPage } from "./pages/AccountRecoveryLookupPage";
import { StudentEmailLookupPage } from "./pages/StudentEmailLookupPage";
import { FeedbackPage } from "./pages/FeedbackPage";
import { SearchPage } from "./pages/SearchPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AuthProvider } from "./admin/AuthContext";
import { ProtectedRoute } from "./admin/ProtectedRoute";

// Trang quan tri duoc tach bundle rieng (lazy): khach cong khai khong can tai
// ma cua trinh soan thao (Tiptap) va cac man hinh admin khac.
const AdminLayout = lazy(() => import("./admin/layouts/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const LoginPage = lazy(() => import("./admin/pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("./admin/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const CategoriesPage = lazy(() => import("./admin/pages/CategoriesPage").then((m) => ({ default: m.CategoriesPage })));
const PageBuilderPage = lazy(() => import("./admin/pages/PageBuilderPage").then((m) => ({ default: m.PageBuilderPage })));
const BannersPage = lazy(() => import("./admin/pages/BannersPage").then((m) => ({ default: m.BannersPage })));
const NotificationsAdminPage = lazy(() =>
  import("./admin/pages/NotificationsAdminPage").then((m) => ({ default: m.NotificationsAdminPage })),
);
const FormsAdminPage = lazy(() => import("./admin/pages/FormsAdminPage").then((m) => ({ default: m.FormsAdminPage })));
const PostsListPage = lazy(() => import("./admin/pages/PostsListPage").then((m) => ({ default: m.PostsListPage })));
const PostEditPage = lazy(() => import("./admin/pages/PostEditPage").then((m) => ({ default: m.PostEditPage })));
const DocumentTypesPage = lazy(() => import("./admin/pages/DocumentTypesPage").then((m) => ({ default: m.DocumentTypesPage })));
const DocumentNumbersPage = lazy(() =>
  import("./admin/pages/DocumentNumbersPage").then((m) => ({ default: m.DocumentNumbersPage })),
);
const CongVanPage = lazy(() => import("./admin/pages/CongVanPage").then((m) => ({ default: m.CongVanPage })));
const AccountRecoveryAdminPage = lazy(() =>
  import("./admin/pages/AccountRecoveryPage").then((m) => ({ default: m.AccountRecoveryPage })),
);
const TasksPage = lazy(() => import("./admin/pages/TasksPage").then((m) => ({ default: m.TasksPage })));
const ReportsPage = lazy(() => import("./admin/pages/ReportsPage").then((m) => ({ default: m.ReportsPage })));
const UsersPage = lazy(() => import("./admin/pages/UsersPage").then((m) => ({ default: m.UsersPage })));
const MembersPage = lazy(() => import("./admin/pages/MembersPage").then((m) => ({ default: m.MembersPage })));
const SettingsPage = lazy(() => import("./admin/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })));
const FeedbackAdminPage = lazy(() => import("./admin/pages/FeedbackAdminPage").then((m) => ({ default: m.FeedbackAdminPage })));
const GalleryAdminPage = lazy(() => import("./admin/pages/GalleryAdminPage").then((m) => ({ default: m.GalleryAdminPage })));
const StudentEmailsPage = lazy(() => import("./admin/pages/StudentEmailsPage").then((m) => ({ default: m.StudentEmailsPage })));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <p className="text-sm text-neutral-500">Đang tải…</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="danh-muc/:slug" element={<CategoryPage />} />
          <Route path="trang/*" element={<SitePage />} />
          <Route path="tin/:slug" element={<PostDetailPage />} />
          <Route path="bieu-mau" element={<FormsPage />} />
          <Route path="thong-bao" element={<NotificationsPage />} />
          <Route path="cong-khai" element={<DisclosuresPage />} />
          <Route path="gui-van-ban" element={<SubmitDocumentPage />} />
          <Route path="khoi-phuc-tai-khoan" element={<AccountRecoveryPage />} />
          <Route path="tra-cuu-ket-qua" element={<AccountRecoveryLookupPage />} />
          <Route path="hom-thu-gop-y" element={<FeedbackPage />} />
          <Route path="tra-cuu-email" element={<StudentEmailLookupPage />} />
          <Route path="tim-kiem" element={<SearchPage />} />
        </Route>

        <Route
          path="admin/dang-nhap"
          element={
            <Suspense fallback={<AdminFallback />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route path="admin" element={<ProtectedRoute />}>
          <Route
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="bai-viet" element={<PostsListPage />} />
            <Route path="bai-viet/moi" element={<PostEditPage />} />
            <Route path="bai-viet/:id" element={<PostEditPage />} />
            <Route path="danh-muc" element={<CategoriesPage />} />
            <Route path="trang/:categoryId" element={<PageBuilderPage />} />
            <Route path="banner" element={<BannersPage />} />
            <Route path="bieu-mau" element={<FormsAdminPage />} />
            <Route path="thong-bao" element={<NotificationsAdminPage />} />
            <Route path="van-ban" element={<DocumentNumbersPage />} />
            <Route path="loai-van-ban" element={<DocumentTypesPage />} />
            <Route path="doi-chieu-cong-van" element={<CongVanPage />} />
            <Route path="khoi-phuc-tai-khoan" element={<AccountRecoveryAdminPage />} />
            <Route path="gop-y" element={<FeedbackAdminPage />} />
            <Route path="thu-vien" element={<GalleryAdminPage />} />
            <Route path="danh-ba-email" element={<StudentEmailsPage />} />
            <Route path="nhiem-vu" element={<TasksPage />} />
            <Route path="bao-cao" element={<ReportsPage />} />
            <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
              <Route path="nguoi-dung" element={<UsersPage />} />
              <Route path="nhan-su" element={<MembersPage />} />
              <Route path="cau-hinh" element={<SettingsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
