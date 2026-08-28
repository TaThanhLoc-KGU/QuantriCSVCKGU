# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + Tailwind CSS. Bắt buộc theo yêu cầu ban đầu của chủ dự án (không phải lựa chọn được uỷ quyền cho AI) — không dùng Next.js/framework SSR khác. Backend là REST API riêng (Spring Boot, đã xây dựng và kiểm thử xong ở `backend/`), frontend chỉ là lớp trình bày gọi API qua `fetch`/`axios`.

## Users

- **Giảng viên, sinh viên, cán bộ Trường Đại học Kiên Giang** (không đăng nhập) — tra cứu tin tức nội bộ, tải biểu mẫu, xem thông báo của Phòng QTCSVC.
- **Đơn vị/nhà thầu/đối tác bên ngoài trường** (không đăng nhập) — theo dõi thông tin công khai mua sắm, đấu thầu tại khu "Công khai".
- **Chuyên viên/lãnh đạo Phòng QTCSVC** (đăng nhập — STAFF/EDITOR/ADMIN) — quản lý nội dung, sổ số văn bản, nhiệm vụ, báo cáo. (Ngoài phạm vi đợt xây UI public đầu tiên, nhưng thuộc cùng sản phẩm.)

## Product Purpose

Kênh thông tin chính thức và công cụ quản trị nội bộ của Phòng Quản trị Cơ sở vật chất, Trường Đại học Kiên Giang: công khai tin tức/thông báo/biểu mẫu cho cộng đồng trường và đối tác bên ngoài, đồng thời số hoá quy trình cấp số văn bản, giao việc nội bộ, và báo cáo định kỳ — thay thế cách làm thủ công cũ (Excel sổ văn bản, dữ liệu rời rạc trên Firebase/Firestore của hệ thống cũ `QuantriCSVCKGU`).

## Positioning

Không phải sản phẩm thương mại cạnh tranh thị trường — đây là hệ thống nội bộ hợp nhất toàn bộ nghiệp vụ của một phòng ban (nội dung công khai + sổ văn bản + quản lý nhiệm vụ + báo cáo) vào một chỗ duy nhất, thay vì rải rác nhiều công cụ như trước.

## Operating Context

- Chạy trên server nội bộ ML110 (Rocky Linux) qua Docker Compose; PostgreSQL + MinIO tự host.
- Đăng nhập bằng tài khoản nội bộ (do ADMIN cấp) hoặc SSO Google Education giới hạn domain `@vnkgu.edu.vn` — không tự mở đăng ký.
- Văn bản hành chính xuất ra (báo cáo, sổ số văn bản) phải đúng thể thức nhà nước: quốc hiệu, font Times New Roman, canh lề chuẩn.
- Cao điểm sử dụng: đầu năm học (nhiều thông báo/biểu mẫu mới) và các kỳ báo cáo tháng/quý.

## Capabilities and Constraints

- Đợt xây dựng UI đầu tiên là **khu vực public** (không đăng nhập): trang chủ, danh mục tin (cây danh mục con không giới hạn cấp), chi tiết bài viết, biểu mẫu tải về, thông báo, khu Công khai (mua sắm), tìm kiếm full-text tiếng Việt không dấu.
- Backend REST API đã hoàn thiện và có bộ test (MockMvc + Spring REST Docs, 25 test pass) — UI chỉ tiêu thụ API có sẵn dưới `/api/public/**`, không tự phát sinh nghiệp vụ mới ở tầng frontend.
- Bắt buộc UI tiếng Việt có dấu đầy đủ, xuyên suốt toàn bộ giao diện — không viết tắt bỏ dấu trong nội dung hiển thị cho người dùng.
- Responsive (mobile + desktop), có slug URL, meta title/description từng trang, sitemap.xml, ảnh lazy-load (yêu cầu SEO cơ bản từ spec).
- Đăng bài không qua duyệt (đăng ngay); `viewCount` chống đếm trùng theo phiên.
- Chưa xác định: khu vực admin (đăng nhập) sẽ làm ở đợt UI tiếp theo, sau khi khu public hoàn thiện.

## Brand Commitments

- Tên hiển thị bắt buộc, viết đầy đủ dấu: **"Phòng Quản trị Cơ sở vật chất — Trường Đại học Kiên Giang"**.
- Chưa có logo chính thức của trường.
- **Bảng màu đã chốt (chủ dự án chọn, ghi đè đề xuất ban đầu):** xanh dương (thương hiệu chính/header/nav/nút chính), trắng (nền), xám (viền/text phụ), xanh lá đậm (điểm nhấn phụ/trạng thái còn hiệu lực). Không dùng hướng "giấy lưu trữ + đỏ đô" đã đề xuất ban đầu.
- **Bố cục đã chốt:** trang thông tin theo cấu trúc quy ước, quen thuộc — menu đầy đủ các mục hiển thị ngay (không ẩn trong mục lục thu gọn kiểu thư viện).
- Kiểu chữ: không có yêu cầu đặc thù — dùng font hệ thống sạch, dễ đọc, hỗ trợ tốt tiếng Việt có dấu (Inter).

## Evidence on Hand

- Chưa có nội dung/ảnh thật từ trường. Có dữ liệu mẫu (seed Flyway `V8__seed.sql`): vài danh mục tin mẫu, loại văn bản mặc định, nhân sự mẫu — dùng để dựng giao diện, không phải nội dung thật.
- Không có ảnh, logo, hay tư liệu hình ảnh nào được cung cấp — không tự bịa hình ảnh thương hiệu hoặc nội dung giả định là thật.

## Product Principles

1. **Public trước, quét nhanh** — người ghé trang không đăng nhập phải tìm thấy tin/biểu mẫu/thông báo cần trong vài giây, không phải đào bới menu.
2. **Song hành hai đối tượng** — nội dung nội bộ (tin tức, biểu mẫu cho giảng viên/sinh viên) và khu Công khai (mua sắm cho đối tác/nhà thầu) phải rõ ràng, ngang hàng, không đối tượng nào bị lu mờ.
3. **Đúng thể thức hành chính** — mọi nơi hiển thị/xuất văn bản chính thức phải tôn trọng chuẩn hành chính nhà nước Việt Nam.
4. **UI là lớp trình bày, không phát sinh nghiệp vụ** — tận dụng đúng API backend đã kiểm thử; không tự thêm luật nghiệp vụ mới ở frontend.
5. **Tiếng Việt chuẩn, có dấu** — xuyên suốt mọi nhãn, thông báo lỗi, placeholder, không có ngoại lệ.

## Accessibility & Inclusion

Chưa có yêu cầu đặc thù nào được xác nhận từ chủ dự án — áp dụng thực hành accessibility tốt theo mặc định (độ tương phản đủ, điều hướng bàn phím, alt text cho ảnh).
