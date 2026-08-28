-- Du lieu mau de dung giao dien public (khong phai noi dung that - se thay
-- khi ADMIN nhap that qua man hinh quan tri). Dung id danh muc/tai khoan admin
-- da co san tu V8.

INSERT INTO banners (title, image_url, link_url, sort_order, active, start_date, end_date) VALUES
    ('Thông báo lịch bảo trì hệ thống điện toàn trường', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80', NULL, 1, TRUE, NULL, NULL);

INSERT INTO posts (title, slug, summary, content, thumbnail_url, category_id, author_id, status, featured, pinned, view_count, published_at, created_at, updated_at)
SELECT
    'Nghiệm thu cải tạo dãy phòng học B',
    'nghiem-thu-cai-tao-day-phong-hoc-b',
    'Phòng Quản trị Cơ sở vật chất phối hợp các đơn vị liên quan hoàn thành nghiệm thu cải tạo dãy phòng học B, đưa vào sử dụng từ học kỳ mới.',
    '<p>Ngày 28/07/2026, Phòng Quản trị Cơ sở vật chất đã phối hợp cùng đơn vị thi công và các khoa liên quan tổ chức nghiệm thu công trình cải tạo dãy phòng học B.</p><p>Công trình bao gồm sửa chữa hệ thống điện, thay mới bàn ghế, sơn lại toàn bộ tường và trần, đảm bảo điều kiện học tập tốt nhất cho sinh viên trong học kỳ tới.</p><h2>Nội dung cải tạo</h2><ul><li>Thay mới 120 bộ bàn ghế sinh viên</li><li>Cải tạo hệ thống chiếu sáng 12 phòng học</li><li>Sơn sửa toàn bộ mặt tiền và hành lang</li></ul><p>Dự kiến các phòng học sẽ được đưa vào sử dụng ngay từ đầu học kỳ 1 năm học 2026-2027.</p>',
    'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
    c.id, 1, 'PUBLISHED', TRUE, TRUE, 42, now() - interval '2 days', now() - interval '2 days', now() - interval '2 days'
FROM categories c WHERE c.slug = 'tin-hoat-dong' AND c.kind = 'POST';

INSERT INTO posts (title, slug, summary, content, thumbnail_url, category_id, author_id, status, featured, pinned, view_count, published_at, created_at, updated_at)
SELECT
    'Kế hoạch bảo trì hệ thống PCCC quý III/2026',
    'ke-hoach-bao-tri-pccc-quy-3-2026',
    'Triển khai kiểm tra, bảo trì định kỳ hệ thống phòng cháy chữa cháy tại các cơ sở của trường trong quý III.',
    '<p>Nhằm đảm bảo an toàn phòng cháy chữa cháy (PCCC) cho toàn bộ cơ sở vật chất nhà trường, Phòng Quản trị Cơ sở vật chất thông báo kế hoạch kiểm tra, bảo trì định kỳ hệ thống PCCC quý III/2026.</p><p>Thời gian thực hiện: từ 05/08/2026 đến 20/08/2026 tại các toà nhà A, B, C và khu ký túc xá.</p>',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
    c.id, 1, 'PUBLISHED', TRUE, FALSE, 27, now() - interval '5 days', now() - interval '5 days', now() - interval '5 days'
FROM categories c WHERE c.slug = 'tin-hoat-dong' AND c.kind = 'POST';

INSERT INTO posts (title, slug, summary, content, thumbnail_url, category_id, author_id, status, featured, pinned, view_count, published_at, created_at, updated_at)
SELECT
    'Trồng bổ sung cây xanh khuôn viên khu B',
    'trong-bo-sung-cay-xanh-khuon-vien-khu-b',
    'Hoạt động trồng bổ sung 50 cây xanh nhằm cải thiện cảnh quan và môi trường học tập.',
    '<p>Trong khuôn khổ kế hoạch cải thiện cảnh quan môi trường năm 2026, Phòng Quản trị Cơ sở vật chất đã tổ chức trồng bổ sung 50 cây xanh tại khuôn viên khu B.</p>',
    NULL,
    c.id, 1, 'PUBLISHED', FALSE, FALSE, 15, now() - interval '9 days', now() - interval '9 days', now() - interval '9 days'
FROM categories c WHERE c.slug = 'tin-hoat-dong' AND c.kind = 'POST';

INSERT INTO posts (title, slug, summary, content, thumbnail_url, category_id, author_id, status, featured, pinned, view_count, published_at, created_at, updated_at)
SELECT
    'Thông báo mời báo giá mua sắm thiết bị máy chiếu',
    'moi-bao-gia-mua-sam-thiet-bi-may-chieu',
    'Phòng Quản trị Cơ sở vật chất thông báo mời các đơn vị cung cấp báo giá thiết bị máy chiếu phòng học.',
    '<p>Căn cứ nhu cầu trang bị thiết bị giảng dạy năm học 2026-2027, Phòng Quản trị Cơ sở vật chất kính mời các đơn vị có năng lực cung cấp gửi báo giá thiết bị máy chiếu phòng học.</p><p>Số lượng: 30 bộ. Hạn nhận báo giá: trước 15/08/2026.</p>',
    NULL,
    c.id, 1, 'PUBLISHED', FALSE, FALSE, 8, now() - interval '1 days', now() - interval '1 days', now() - interval '1 days'
FROM categories c WHERE c.slug = 'cong-khai' AND c.kind = 'POST';

INSERT INTO notifications (title, content, type, level, pinned, effective_date, expiry_date, created_by, created_at) VALUES
    ('Tạm ngưng cấp nước khu ký túc xá ngày 03/08/2026', '<p>Để phục vụ công tác sửa chữa đường ống chính, hệ thống cấp nước khu ký túc xá sẽ tạm ngưng từ 08:00 đến 16:00 ngày 03/08/2026.</p>', 'GENERAL', 'URGENT', TRUE, CURRENT_DATE - 1, CURRENT_DATE + 5, 1, now() - interval '1 days'),
    ('Lịch làm việc Phòng QTCSVC trong dịp lễ', '<p>Phòng Quản trị Cơ sở vật chất thông báo lịch trực và làm việc trong các ngày nghỉ lễ sắp tới.</p>', 'GENERAL', 'NORMAL', TRUE, CURRENT_DATE - 3, CURRENT_DATE + 20, 1, now() - interval '3 days'),
    ('Kế hoạch lựa chọn nhà thầu gói thầu sửa chữa mái tôn nhà đa năng', '<p>Thông báo công khai kế hoạch lựa chọn nhà thầu thực hiện gói thầu sửa chữa mái tôn nhà đa năng theo quy định.</p>', 'PROCUREMENT', 'NORMAL', FALSE, CURRENT_DATE - 2, CURRENT_DATE + 30, 1, now() - interval '2 days');

INSERT INTO media_files (file_name, original_name, url, mime_type, size, folder, uploaded_by, created_at) VALUES
    ('forms/mau-don-de-nghi-sua-chua.docx', 'mau-don-de-nghi-sua-chua.docx', '/api/public/media/1', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 24576, 'forms', 1, now());

INSERT INTO forms (title, description, category_id, file_id, version, download_count, active, created_at, updated_at)
SELECT
    'Đơn đề nghị sửa chữa thiết bị, cơ sở vật chất',
    'Mẫu đơn dùng khi đề nghị sửa chữa, bảo trì thiết bị hoặc cơ sở vật chất trong trường.',
    c.id, mf.id, 'v2026', 0, TRUE, now(), now()
FROM categories c, media_files mf
WHERE c.slug = 'bieu-mau-chung' AND c.kind = 'FORM' AND mf.file_name = 'forms/mau-don-de-nghi-sua-chua.docx';
