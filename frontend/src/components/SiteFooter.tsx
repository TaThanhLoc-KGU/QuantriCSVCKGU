import { Link } from "react-router-dom";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-base font-bold text-white">Phòng Quản trị Cơ sở vật chất</p>
          <p className="mt-1 text-sm text-brand-200">Trường Đại học Kiên Giang</p>
          <p className="mt-3 text-sm leading-relaxed text-brand-200">
            Tầng 7, Nhà Điều hành, Trường Đại học Kiên Giang
          </p>
          <p className="mt-3 text-sm leading-relaxed text-brand-200">
            320A, Quốc lộ 61, Xã Châu Thành, Tỉnh An Giang
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">Liên hệ</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li>
              <a href="mailto:pqtcsvc@vnkgu.edu.vn" className="hover:text-white hover:underline">
                qtcsvc@vnkgu.edu.vn
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">Truy cập nhanh</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            <li>
              <Link to="/bieu-mau" className="hover:text-white hover:underline">
                Biểu mẫu
              </Link>
            </li>
            <li>
              <Link to="/thong-bao" className="hover:text-white hover:underline">
                Thông báo
              </Link>
            </li>
            <li>
              <Link to="/cong-khai" className="hover:text-white hover:underline">
                Công khai mua sắm
              </Link>
            </li>
            <li>
              <Link to="/khoi-phuc-tai-khoan" className="hover:text-white hover:underline">
                Hỗ trợ khôi phục tài khoản
              </Link>
            </li>
            <li>
              <Link to="/tra-cuu-ket-qua" className="hover:text-white hover:underline">
                Tra cứu kết quả xử lý
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-800">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-brand-300">
          © {year} Phòng Quản trị Cơ sở vật chất — Trường Đại học Kiên Giang.
        </p>
      </div>
    </footer>
  );
}
