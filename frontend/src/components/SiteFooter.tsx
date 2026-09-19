import { Link } from "react-router-dom";
import { useSiteInfo } from "../lib/useSiteInfo";
import { VisitorCounter } from "./VisitorCounter";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const site = useSiteInfo();

  return (
    <footer className="mt-16 border-t border-neutral-200 bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-base font-bold text-white">{site.name}</p>
          <p className="mt-1 text-sm text-brand-200">{site.subtitle}</p>
          {site.address && <p className="mt-3 text-sm leading-relaxed text-brand-200">{site.address}</p>}
          {site.address2 && <p className="mt-3 text-sm leading-relaxed text-brand-200">{site.address2}</p>}
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">Liên hệ</p>
          <ul className="mt-3 space-y-2 text-sm text-brand-200">
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-white hover:underline">
                  {site.email}
                </a>
              </li>
            )}
            {site.phone && (
              <li>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white hover:underline">
                  {site.phone}
                </a>
              </li>
            )}
            {site.facebook && (
              <li>
                <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                  Facebook
                </a>
              </li>
            )}
            {site.youtube && (
              <li>
                <a href={site.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                  YouTube
                </a>
              </li>
            )}
          </ul>
          <VisitorCounter />
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
                Công khai
              </Link>
            </li>
            <li>
              <Link to="/hom-thu-gop-y" className="hover:text-white hover:underline">
                Hòm thư góp ý
              </Link>
            </li>
            <li>
              <Link to="/khoi-phuc-tai-khoan" className="hover:text-white hover:underline">
                Hỗ trợ khôi phục tài khoản
              </Link>
            </li>
            <li>
              <Link to="/tra-cuu-email" className="hover:text-white hover:underline">
                Tra cứu email sinh viên
              </Link>
            </li>
            {site.parentUrl && (
              <li>
                <a href={site.parentUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                  Website Trường
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-800">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-brand-300">
          © {year} {site.name} — {site.subtitle}.
        </p>
      </div>
    </footer>
  );
}
