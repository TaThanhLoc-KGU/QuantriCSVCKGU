import { Link } from "react-router-dom";
import { useSiteInfo } from "../lib/useSiteInfo";
import { VisitorCounter } from "./VisitorCounter";

const col = "px-5 py-6";
const heading = "mb-3 text-xs font-bold uppercase tracking-[0.08em] text-white";
const link = "block py-1 text-sm text-brand-100 hover:text-white hover:underline";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const site = useSiteInfo();

  return (
    <footer className="mt-12 border-t-4 border-brand-700 bg-brand-900 text-brand-100">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="grid divide-y divide-brand-700 border-x border-brand-700 md:grid-cols-4 md:divide-x md:divide-y-0">
          <div className={col}>
            <img src={site.logoUrl} alt="" className="mb-3 h-12 w-12 bg-white/95 object-contain p-1" />
            <p className="text-base font-extrabold uppercase text-white">{site.name}</p>
            <p className="mt-0.5 text-sm text-brand-200">{site.subtitle}</p>
            {site.footerNote && <p className="mt-3 text-sm leading-relaxed text-brand-200">{site.footerNote}</p>}
          </div>

          <div className={col}>
            <p className={heading}>Liên hệ</p>
            <address className="space-y-1.5 text-sm not-italic text-brand-100">
              {site.address && <p>{site.address}</p>}
              {site.address2 && <p>{site.address2}</p>}
              {site.phone && (
                <p className="tnum">
                  <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-white hover:underline">
                    {site.phone}
                  </a>
                </p>
              )}
              {site.email && (
                <p>
                  <a href={`mailto:${site.email}`} className="hover:text-white hover:underline">
                    {site.email}
                  </a>
                </p>
              )}
            </address>
            <div className="mt-3 flex gap-3 text-sm">
              {site.facebook && (
                <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">
                  Facebook
                </a>
              )}
              {site.youtube && (
                <a href={site.youtube} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:underline">
                  YouTube
                </a>
              )}
            </div>
          </div>

          <div className={col}>
            <p className={heading}>Tiện ích</p>
            <Link to="/bieu-mau" className={link}>
              Biểu mẫu
            </Link>
            <Link to="/thong-bao" className={link}>
              Thông báo
            </Link>
            <Link to="/cong-khai" className={link}>
              Công khai
            </Link>
            <Link to="/gui-van-ban" className={link}>
              Gửi văn bản
            </Link>
            <Link to="/hom-thu-gop-y" className={link}>
              Hòm thư góp ý
            </Link>
          </div>

          <div className={col}>
            <p className={heading}>Hỗ trợ sinh viên</p>
            <Link to="/khoi-phuc-tai-khoan" className={link}>
              Khôi phục tài khoản
            </Link>
            <Link to="/tra-cuu-ket-qua" className={link}>
              Tra cứu kết quả xử lý
            </Link>
            <Link to="/tra-cuu-email" className={link}>
              Tra cứu email sinh viên
            </Link>
            {site.parentUrl && (
              <a href={site.parentUrl} target="_blank" rel="noopener noreferrer" className={link}>
                Website Trường
              </a>
            )}
            <VisitorCounter />
          </div>
        </div>
      </div>

      <div className="border-t border-brand-700 bg-brand-900">
        <p className="mx-auto max-w-[1200px] px-4 py-3 text-xs text-brand-300">
          © {year} {site.name} — {site.subtitle}
        </p>
      </div>
    </footer>
  );
}
