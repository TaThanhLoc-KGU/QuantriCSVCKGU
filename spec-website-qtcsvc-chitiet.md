# SPEC CHI TIẾT — Website Phòng Quản trị Cơ sở Vật chất (QTCSVC)
**Đối tượng đọc:** Claude Code (handoff để build). **Ngôn ngữ code/comment:** tùy chọn, UI tiếng Việt.
**Nguồn gộp:** dự án cũ `QuantriCSVCKGU` (React + Vite + Tailwind + Firebase/Firestore, deploy Vercel) — migrate sang stack dưới đây; frontend React tái dùng component (cây Năm/Quý/Tháng, DocumentsView, KpiCards, MemberTable).

---

## 0. Quyết định nền tảng (đã chốt)

| Vấn đề | Quyết định |
|---|---|
| Host | Server nội bộ **ML110 (Rocky Linux)**, chạy bằng **Docker Compose** |
| DB | **PostgreSQL tự dựng** (container) |
| Lưu file | **MinIO** (container) |
| Backend | **Spring Boot 3** (Java 17+) — REST API |
| Frontend | **React + Vite + Tailwind** (giữ từ repo cũ) |
| Đăng nhập | **Tài khoản cấp riêng (local)** + **SSO Google Education** (OAuth2, giới hạn domain trường) |
| Thứ tự làm | **Backend dựng ĐỦ tất cả tính năng trước** (văn bản + nhiệm vụ + web) → sau đó làm **UI**, ưu tiên **public trước** |

> **Giả định cần xác nhận:** domain email trường cho SSO (mặc định `@vnkgu.edu.vn`; nếu sinh viên/CB dùng domain khác thì cấu hình thêm trong Settings).

---

## 1. Kiến trúc tổng thể

Bốn khối chức năng, chung một backend + một DB:

1. **PUBLIC** — trang tin tức công khai (không đăng nhập).
2. **ADMIN · Nội dung** — quản lý tin/biểu mẫu/thông báo/banner/danh mục/media.
3. **ADMIN · Sổ số văn bản** — cấp số & ghi sổ các loại văn bản (đi và đến).
4. **ADMIN · Nhiệm vụ & Báo cáo** — theo dõi tiến độ + giao việc + xuất báo cáo Word.

**Triển khai (docker-compose):** `postgres`, `minio`, `backend` (Spring Boot), `frontend` (React build tĩnh qua Nginx), `reverse-proxy` (Nginx/Caddy — TLS, route `/api` → backend, còn lại → frontend).

---

## 2. Xác thực & phân quyền

### 2.1. Cơ chế đăng nhập
- **Local:** username + mật khẩu (BCrypt). Tài khoản do ADMIN tạo.
- **Google Education SSO:** OAuth2 Authorization Code. Chỉ chấp nhận email thuộc domain cấu hình. Lần đầu đăng nhập bằng Google:
  - Nếu email đã khớp một `User` (đã được ADMIN cấp) → liên kết `googleSub`, cho vào.
  - Nếu email chưa có → **từ chối** (không tự tạo tài khoản), báo "liên hệ quản trị". *(Không mở đăng ký tự do.)*
- Sau đăng nhập (cả 2 cách) → cấp **JWT** (access + refresh). Frontend gắn `Authorization: Bearer`.

### 2.2. Vai trò
| Role | Ý nghĩa |
|---|---|
| **STAFF** | Chuyên viên trong phòng |
| **EDITOR** | Chuyên viên có thêm quyền quản nội dung/danh mục và nhiệm vụ chung phòng (vd trưởng/phó phòng) |
| **ADMIN** | Quản trị hệ thống |

### 2.3. Ma trận quyền (tóm tắt)
| Chức năng | STAFF | EDITOR | ADMIN |
|---|---|---|---|
| Đăng/sửa/xóa **bài viết, biểu mẫu, thông báo** | ✔ (của mình, **đăng ngay**) | ✔ (tất cả) | ✔ |
| Quản lý **danh mục, banner** | ✘ | ✔ | ✔ |
| **Xin số văn bản** (ghi sổ trực tiếp) | ✔ | ✔ | ✔ |
| Sửa/xóa dòng sổ văn bản của người khác | ✘ | ✔ | ✔ |
| Cấu hình **loại văn bản** | ✘ | ✘ | ✔ |
| **Nhiệm vụ cá nhân** (của mình) | ✔ | ✔ | ✔ |
| **Nhiệm vụ chung phòng** (tạo/sửa) | ✘ (chỉ xem) | ✔ | ✔ |
| **Báo cáo** (soạn/xuất Word) | ✔ | ✔ | ✔ |
| **Cấu hình AI (API key)** | ✘ | ✘ | ✔ |
| Quản lý **người dùng, thành viên** | ✘ | ✘ | ✔ |

> Nội dung public **đăng ngay**, không có bước duyệt bắt buộc. Trạng thái `DRAFT` chỉ để tự lưu nháp; `PUBLISHED` là hiện ra ngoài.

---

## 3. Mô hình dữ liệu (PostgreSQL / JPA)

Kiểu: `id` = BIGINT identity. Mốc thời gian = `timestamptz`. Chuỗi dài = `text`.

### 3.1. Người dùng & nhân sự
**User**: id, username(unique, nullable nếu chỉ SSO), email(unique), fullName, passwordHash(nullable), authProvider(`LOCAL`/`GOOGLE`/`BOTH`), googleSub(nullable), role(`STAFF`/`EDITOR`/`ADMIN`), memberId(→Member, nullable), active(bool), lastLoginAt, createdAt

**Member** (nhân sự phòng — dùng làm người phụ trách nhiệm vụ, tách khỏi tài khoản đăng nhập): id, name, position, email, phone, active, sortOrder

### 3.2. Nội dung / public
**Category**: id, name, slug(unique trong cùng kind), kind(`POST`/`FORM`), parentId(→Category, nullable → cây con không giới hạn cấp), sortOrder, description
- Ràng buộc: không cho `parentId` tạo vòng lặp; slug sinh tự động từ name (bỏ dấu) + hậu tố nếu trùng.

**Post**: id, title, slug(unique), summary, content(HTML), thumbnailUrl(nullable), categoryId(→Category kind=POST), authorId(→User), status(`DRAFT`/`PUBLISHED`), featured(bool), pinned(bool), viewCount(int), publishedAt(nullable), createdAt, updatedAt

**Banner**: id, title, imageUrl, linkUrl(nullable), sortOrder, active, startDate(nullable), endDate(nullable)

**MediaFile**: id, fileName(tên lưu trên MinIO), originalName, url, mimeType, size, folder(vd `posts`,`banners`,`forms`), uploadedBy(→User), createdAt

**Form** (biểu mẫu tải về): id, title, description, categoryId(→Category kind=FORM), fileId(→MediaFile), version(text, vd "v2024"), downloadCount(int), active, createdAt, updatedAt

**Notification** (thông báo): id, title, content(HTML), type(`GENERAL`/`PROCUREMENT`), level(`NORMAL`/`URGENT`), pinned(bool), effectiveDate, expiryDate(nullable), createdBy(→User), createdAt
- `type=PROCUREMENT` = công khai mua sắm (hiển thị ở khu "Công khai").

### 3.3. Sổ số văn bản
**DocumentType**: id, code(unique, vd `BC`,`QD`,`KH`,`HD`,`TTR`,`DN`,`CV`,`DN_DEN`), name(vd "Báo cáo"), symbolCode(ký hiệu ghép sau số, vd `BC-QTCSVC`), direction(`OUTGOING`/`INCOMING`), resetYearly(bool, default true), sortOrder, active
- **Seed mặc định (OUTGOING):** Báo cáo `BC-QTCSVC`, Quyết định `QĐ-QTCSVC`, Kế hoạch `KH-QTCSVC`, Hợp đồng `HĐ-QTCSVC`, Tờ trình `TTr-QTCSVC`, Đề nghị `ĐN-QTCSVC`, Công văn đi `ĐHKG-QTCSVC`.
- **Seed (INCOMING):** "Tiếp nhận đề nghị đơn vị khác" (sổ văn bản đến) `DN_DEN`.
- ADMIN sửa được tên/ký hiệu/thêm loại mới.

**DocumentNumber**: id, documentTypeId(→DocumentType), year(int), numberInt(int), numberDisplay(text — sinh sẵn), title(trích yếu), person(người soạn/xử lý — text tự do), issueDate(date), note(nullable), createdBy(→User), createdAt
- **Trường riêng cho INCOMING** (nullable với OUTGOING): senderUnit(nơi gửi), originalRef(số/ký hiệu văn bản gốc), receivedDate.
- `numberDisplay` = `padStart(numberInt,2,'0') + '/' + symbolCode` → `15/TTr-QTCSVC`.
- **Không** đính kèm file. **Không** khóa trùng số — chỉ **cảnh báo** (xem 6.3).

### 3.4. Nhiệm vụ & báo cáo
**Task**: id, scope(`DEPT`/`PERSONAL`), year(int), quarter(1–4, nullable), month(1–12, nullable), title, description(nullable), assigneeId(→Member, nullable), ownerUserId(→User — người tạo/sở hữu, bắt buộc với PERSONAL), status(enum, xem 7.4), progressPercent(int 0–100), sortOrder, createdAt, updatedAt

**TaskStep** (bước con của nhiệm vụ): id, taskId(→Task), title, status(enum, xem 7.4), note(nullable), sortOrder, createdAt, updatedAt

**Report**: id, periodType(`MONTH`/`QUARTER`), periodId(text unique, vd `2026-M3`,`2026-Q1`), year, sections(JSONB — nội dung từng mục, xem 8.2), aiProvider(nullable), aiGeneratedAt(nullable), updatedBy(→User), updatedAt

### 3.5. Cấu hình hệ thống
**SystemSetting**: key(unique), value(text — mã hóa nếu là secret), updatedBy, updatedAt
- Khóa dùng: `ai.provider` (`gemini`/`claude`/`openai`/`none`), `ai.apiKey` (mã hóa), `ai.model`, `sso.allowedDomains`, `org.name`, `org.dept`.

---

## 4. Module PUBLIC (trang tin tức)

### 4.1. Trang chủ `/`
- **Banner slider**: các `Banner` active, trong khoảng start/end, theo sortOrder; tự chạy + điều hướng.
- **Tin nổi bật**: Post `featured=true, status=PUBLISHED` (tối đa N).
- **Tin mới nhất**: Post PUBLISHED, sắp theo publishedAt desc, phân trang.
- **Thông báo ghim**: Notification `pinned=true` còn hiệu lực.
- Menu điều hướng sinh từ cây `Category kind=POST` + các mục cố định (Biểu mẫu, Thông báo, Công khai).

### 4.2. Trang danh mục `/danh-muc/{slug}`
- Hiển thị bài thuộc danh mục **và mọi danh mục con** (đệ quy).
- Cột/nav danh mục con; phân trang; sắp theo pinned → publishedAt.

### 4.3. Chi tiết bài `/tin/{slug}`
- Nội dung HTML, ảnh, tệp đính kèm; tăng `viewCount` (chống spam: 1 view/phiên).
- Bài liên quan (cùng danh mục). Nút chia sẻ. Breadcrumb.

### 4.4. Biểu mẫu `/bieu-mau`
- Liệt kê `Form active` nhóm theo `Category kind=FORM`; tìm kiếm theo tên; nút **Tải về** → `GET /forms/{id}/download` (tăng downloadCount, trả file từ MinIO).

### 4.5. Thông báo `/thong-bao` & Công khai `/cong-khai`
- `/thong-bao`: Notification còn hiệu lực, ghim lên đầu, badge `URGENT`.
- `/cong-khai`: gộp Post thuộc danh mục "Công khai" + Notification `type=PROCUREMENT`.

### 4.6. Tìm kiếm `/tim-kiem?q=`
- Full-text trên Post (title, summary, content) — dùng Postgres `tsvector` tiếng Việt (unaccent).

**Yêu cầu chung public:** responsive, URL slug, meta title/description mỗi trang, sitemap.xml, ảnh lazy-load.

---

## 5. Module ADMIN · Nội dung

### 5.1. Bài viết
- Bảng danh sách: lọc theo danh mục/trạng thái/tác giả, tìm theo tiêu đề.
- Form soạn: tiêu đề (tự sinh slug, sửa được), tóm tắt, **rich text editor** (TipTap) chèn ảnh từ **Media picker**, chọn danh mục, ảnh đại diện, cờ featured/pinned, nút **Lưu nháp** / **Đăng ngay**.
- STAFF chỉ thấy/sửa bài của mình; EDITOR/ADMIN thấy tất cả.

### 5.2. Danh mục (EDITOR/ADMIN)
- Cây kéo-thả sắp thứ tự, thêm danh mục con, sửa tên/slug; chọn kind POST/FORM. Không cho xóa nếu còn bài (hoặc hỏi chuyển bài).

### 5.3. Banner (EDITOR/ADMIN)
- Upload ảnh, đặt link, bật/tắt, sắp thứ tự, đặt khoảng thời gian hiển thị.

### 5.4. Biểu mẫu
- Upload file + metadata (tên, mô tả, danh mục, version). Thay file = tạo MediaFile mới, giữ lịch sử version (tùy chọn).

### 5.5. Thông báo
- Soạn tiêu đề/nội dung, chọn type (GENERAL/PROCUREMENT), level, ghim, ngày hiệu lực/hết hạn.

### 5.6. Media
- Thư viện ảnh/tệp; upload (kéo-thả), xem, xóa; dùng chung cho editor và banner.

---

## 6. Module ADMIN · Sổ số văn bản

### 6.1. Mục tiêu
Cấp số & ghi sổ nhanh cho mọi loại văn bản của phòng, thay file Excel thủ công. **Ai cũng xin số được, ghi thẳng vào sổ, không cần duyệt.**

### 6.2. Màn hình
- **Tab theo loại văn bản** (từ DocumentType active), có bộ lọc **năm**. Mỗi tab = một bảng: Số | Ngày | Trích yếu | Người | (nơi gửi/số gốc nếu INCOMING) | thao tác.
- Nút **+ Xin số**: mở form → chọn loại (đã cố định theo tab), hệ thống **gợi ý số kế tiếp** = `max(numberInt theo loại+năm)+1` (sửa tay được); nhập trích yếu, người, ngày. Lưu → sinh `numberDisplay`.
- Sửa/xóa dòng: người tạo dòng sửa được dòng mình; EDITOR/ADMIN sửa tất cả.
- **Xuất Excel** (`/export?type&year`) và **Nhập Excel** (`/import`) — cột khớp bảng; nhập có xem trước + báo lỗi dòng.

### 6.3. Quy tắc số & cảnh báo trùng
- `resetYearly=true` → mỗi năm số bắt đầu lại.
- Khi lưu, nếu `(type, year, numberInt)` đã tồn tại → **cảnh báo** "Số N đã tồn tại (dòng: …), vẫn lưu?" — **cho phép lưu** (dữ liệu lịch sử có trùng, vd ĐN 20). Không khóa cứng.
- Ghi log `createdBy`, `createdAt`.

### 6.4. Văn bản đến (INCOMING)
- Sổ "Tiếp nhận đề nghị đơn vị khác": thêm cột **nơi gửi**, **số/ký hiệu gốc**, **ngày đến**. Số đến cấp tuần tự riêng.

---

## 7. Module ADMIN · Nhiệm vụ (Quản lý dự án)

### 7.1. Mục tiêu
**Cả hai:** theo dõi tiến độ **và** giao việc. Không thêm metadata ngoài tiến độ (không hạn chót/độ ưu tiên/đính kèm — theo yêu cầu).

### 7.2. Hai loại phạm vi
- **Nhiệm vụ chung phòng (`DEPT`)**: việc hiệu trưởng giao xuống; **EDITOR/ADMIN** (trưởng phòng hoặc người được giao) nhập; **mọi người xem**, gán người phụ trách (`assigneeId`).
- **Nhiệm vụ cá nhân (`PERSONAL`)**: mỗi chuyên viên tự tạo & cập nhật của mình (`ownerUserId`); dùng để tổng hợp báo cáo. STAFF chỉ thấy/sửa nhiệm vụ cá nhân của mình; EDITOR/ADMIN xem được của mọi người (để làm báo cáo phòng).

### 7.3. Cấu trúc cây
`Năm → Quý → Tháng → Nhiệm vụ → Bước`. Điều hướng theo cây (tái dùng YearNode/QuarterNode/MonthNode/TaskNode). Một nhiệm vụ gắn với (year, quarter, month); tháng suy ra quý.

### 7.4. Trạng thái & tiến độ (chi tiết)
**TaskStep.status:** `CHUA_BAT_DAU`, `DANG_LAM`, `HOAN_THANH`, `VUONG_MAC`.
**Task.status:** `CHUA_BAT_DAU`, `DANG_LAM`, `HOAN_THANH`, `VUONG_MAC`, `TAM_DUNG`, `HUY`.

**Quy tắc tính `progressPercent`:**
- Nếu nhiệm vụ **có bước**: `progress = round(số bước HOAN_THANH / tổng bước × 100)`.
  - 0% & chưa bước nào DANG_LAM → status auto `CHUA_BAT_DAU`.
  - 0 < progress < 100 → auto `DANG_LAM`.
  - 100% → auto `HOAN_THANH`.
  - Có ≥1 bước `VUONG_MAC` và chưa đủ 100% → auto `VUONG_MAC`.
- Nếu **không có bước**: người dùng đặt status thủ công; progress map: CHUA_BAT_DAU=0, DANG_LAM=50, HOAN_THANH=100, VUONG_MAC/TAM_DUNG giữ progress hiện tại.
- `TAM_DUNG` và `HUY` **luôn đặt thủ công**, ghi đè auto.

### 7.5. Thao tác
- Thêm/sửa/xóa nhiệm vụ; thêm/sửa/xóa/sắp thứ tự bước; đổi trạng thái bước (dropdown hoặc click). Kéo-thả sắp xếp. Ghi note theo bước.

### 7.6. Dashboard
- KPI theo năm (lọc được quý/tháng): tổng nhiệm vụ, hoàn thành, đang làm, vướng mắc, % hoàn thành chung (KpiCards).
- Bảng thành viên (MemberTable): mỗi Member — số nhiệm vụ, % hoàn thành.

---

## 8. Module ADMIN · Báo cáo

### 8.1. Mục tiêu
Soạn báo cáo **tháng/quý** dựa trên nhiệm vụ trong kỳ, **xuất ra Word** theo mẫu cố định.

### 8.2. Cấu trúc mẫu (sections)
Header chuẩn (quốc hiệu, tên trường/phòng, "Số: …/BC-QTCSVC", tiêu đề "BÁO CÁO — Kết quả công tác {kỳ}"). Thân báo cáo — các mục (lưu trong `Report.sections`):
1. *(mục 1–2 chuẩn — soạn tự do; mặc định: "Đặc điểm tình hình", "Công tác chỉ đạo, điều hành")*
2. …
3. **Công tác Chuyên môn**
   - Về công tác xây dựng, bảo dưỡng, sửa chữa
   - Về công tác quản trị mạng, mua sắm và quản lý tài sản
   - Về công tác cảnh quan và môi trường
   - Về công tác phối hợp *(nếu có)*
4. **Công tác Đoàn thể và Phục vụ cộng đồng**
5. *(Phương hướng kỳ tới — soạn tự do, tùy chọn)*

> Mỗi mục là một ô soạn thảo. `sections` = JSON `{ "muc3.xay_dung": "...", "muc3.mang_muasam": "...", ... }`.

### 8.3. Soạn & sinh bằng AI (tùy chọn)
- Nút **"Sinh nháp bằng AI"**: gom các Task/Step trong kỳ (theo year + quarter/month) → gửi cho AI → AI sắp vào các mục trên → trả nháp để người dùng sửa. (Task không có sẵn nhãn mục nên AI tự phân loại theo nội dung.)
- **Cấu hình AI (chỉ ADMIN, trong Settings):** chọn provider (`gemini`/`claude`/`openai`/tắt), nhập **API key của trường** (lưu mã hóa), chọn model. Nếu `none` → ẩn nút sinh AI.

### 8.4. Xuất Word
- `GET /reports/{periodId}/export/docx` → sinh file .docx bằng **Apache POI** theo mẫu 8.2 (đúng thể thức: font Times New Roman 13–14, canh lề chuẩn văn bản hành chính). Tải về.

---

## 9. Cấu hình hệ thống (ADMIN)
- **AI:** provider, API key (mã hóa AES, không trả key ra client — chỉ trạng thái "đã cấu hình"), model.
- **SSO:** danh sách domain email được phép.
- **Tổ chức:** tên trường/phòng (dùng cho header báo cáo & footer web).
- **Loại văn bản:** CRUD DocumentType.

---

## 10. Tổng hợp API

**Public** `/api/public` *(không auth)*: `GET /categories`, `/posts?category&page&size`, `/posts/{slug}`, `/posts/featured`, `/forms?category`, `/forms/{id}/download`, `/notifications`, `/public-disclosures`, `/banners`, `/search?q`

**Auth** `/api/auth`: `POST /login`, `GET /google/callback`, `POST /refresh`, `GET /me`, `POST /logout`

**Admin** `/api/admin` *(auth + role)*:
- Posts: `GET,POST,PUT /{id},DELETE /{id},PATCH /{id}/status`
- Categories: CRUD · Banners: CRUD · Forms: CRUD · Notifications: CRUD · Media: `POST,GET,DELETE /{id}`
- DocumentTypes: CRUD *(ADMIN)*
- DocumentNumbers: `GET ?type&year`, `GET /next?type&year`, `POST` (body có cờ `confirmDuplicate`), `PUT /{id}`, `DELETE /{id}`, `GET /export?type&year`, `POST /import`
- Members: CRUD
- Tasks: `GET ?scope&year&quarter&month&owner`, `POST`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/status`
- TaskSteps: `GET /tasks/{id}/steps`, `POST`, `PUT /{id}`, `DELETE /{id}`, `PATCH /{id}/status`, `PATCH /reorder`
- Reports: `GET /{periodId}`, `PUT /{periodId}`, `POST /{periodId}/generate` *(AI)*, `GET /{periodId}/export/docx`
- Dashboard: `GET /kpi?year&quarter&month`, `GET /members?year`
- Users: CRUD *(ADMIN)* · Settings: `GET,PUT /settings` *(ADMIN)*

---

## 11. Lộ trình build (theo yêu cầu: backend đủ trước → UI, public trước)

**GĐ B (backend – làm đủ hết trước):**
1. Khung dự án, Docker Compose (postgres, minio), Flyway schema toàn bộ entity mục 3, seed (ADMIN, Member mẫu, DocumentType, Category mẫu, dữ liệu lịch sử từ `seed.mjs`).
2. Auth (local + Google SSO) + phân quyền.
3. API đầy đủ: nội dung/public, sổ văn bản (+Excel), nhiệm vụ+bước+dashboard, báo cáo (+AI +xuất docx), settings.
4. Test API (Swagger/OpenAPI).

**GĐ U (UI – sau khi backend xong):**
5. **Public trước:** trang chủ, danh mục, chi tiết, biểu mẫu, thông báo, công khai, tìm kiếm.
6. Admin: nội dung → sổ văn bản → nhiệm vụ/dashboard → báo cáo → settings/users.

---

## 12. Di trú dữ liệu từ QuantriCSVCKGU (Firestore → Postgres)
- Export Firestore collections: `users, members, tasks, steps, reports, documents`.
- Map: `documents{type,year,numberInt,number,title,date,person}` → `DocumentNumber` (map `type` ttr/dn/cv → DocumentType). `tasks{scope,year,status,...}` → `Task`; `steps` → `TaskStep`; `members` → `Member`; `reports{periodId,content,metadata}` → `Report`.
- `seed.mjs` trong repo cũ chứa dữ liệu lịch sử 2026 (TTr 1–40, ĐN…) — chuyển thành Flyway seed hoặc script import.

---

## 13. Giả định đã đặt (đánh dấu "mặc định" — sửa nếu cần)
- Domain SSO mặc định `@vnkgu.edu.vn`.
- Mục 1–2 và "Phương hướng" của báo cáo để soạn tự do (chỉ mục 3–4 cố định theo yêu cầu).
- Không lưu file đính kèm cho số văn bản; không liên kết số ↔ nhiệm vụ (theo yêu cầu).
- Nhiệm vụ không có hạn chót → không auto "trễ hạn"; trạng thái `TAM_DUNG`/`HUY` đặt tay.
- `viewCount` chống lặp theo phiên; đăng bài không qua duyệt.
