import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Lỗi 404</p>
      <h1 className="mt-2 text-2xl font-bold text-neutral-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm text-neutral-500">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
