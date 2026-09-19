import { Link } from "react-router-dom";

interface SectionHeadingProps {
  title: string;
  viewAllHref?: string;
}

/** Tiêu đề khối theo ngôn ngữ "bảng lịch": ô nhãn màu thương hiệu + vạch dưới đậm. */
export function SectionHeading({ title, viewAllHref }: SectionHeadingProps) {
  return (
    <div className="sheet-head mb-4">
      <h2 className="tag">{title}</h2>
      {viewAllHref && (
        <Link to={viewAllHref} className="more">
          Xem tất cả →
        </Link>
      )}
    </div>
  );
}
