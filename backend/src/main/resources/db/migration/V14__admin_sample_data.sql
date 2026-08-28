-- Du lieu mau cho cac module con lai (so van ban, nhiem vu, bao cao) de
-- man hinh ADMIN co du lieu thuc te khi kiem thu. Khong phai du lieu that.

INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 12, '12/' || dt.symbol_code, 'Phê duyệt kế hoạch bảo trì hệ thống điện quý III/2026', 'Nguyễn Văn A', DATE '2026-07-15', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'QD';

INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 8, '08/' || dt.symbol_code, 'Kế hoạch bảo trì hệ thống PCCC quý III/2026', 'Trần Thị B', DATE '2026-07-20', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'KH';

INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 45, '45/' || dt.symbol_code, 'Mời báo giá thiết bị máy chiếu phòng học', 'Nguyễn Văn A', DATE '2026-08-01', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'CV';

INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 6, '06/' || dt.symbol_code, 'Báo cáo công tác quý II/2026', 'Nguyễn Văn A', DATE '2026-07-05', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'BC';

INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 3, '03/' || dt.symbol_code, 'Đề nghị bổ sung kinh phí sửa chữa dãy phòng học B', 'Trần Thị B', DATE '2026-06-20', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';

INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 3, '03/' || dt.symbol_code, 'Đề nghị sửa chữa hệ thống điều hòa', NULL, DATE '2026-07-28', NULL, 'Khoa Công nghệ thông tin', '12/ĐN-CNTT', DATE '2026-07-28', 1
FROM document_types dt WHERE dt.code = 'DN_DEN';

INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 4, '04/' || dt.symbol_code, 'Đề nghị thay bóng đèn hành lang ký túc xá', NULL, DATE '2026-07-30', NULL, 'Ban Quản lý Ký túc xá', '05/ĐN-KTX', DATE '2026-07-30', 1
FROM document_types dt WHERE dt.code = 'DN_DEN';

INSERT INTO tasks (scope, year, quarter, month, title, description, assignee_id, owner_user_id, status, progress_percent, sort_order)
SELECT 'DEPT', 2026, 3, NULL, 'Cải tạo dãy phòng học B', 'Sửa chữa điện, thay bàn ghế, sơn sửa toàn bộ dãy phòng học B', m.id, 1, 'HOAN_THANH', 100, 1
FROM members m WHERE m.email = 'nguyenvana@vnkgu.edu.vn';

INSERT INTO tasks (scope, year, quarter, month, title, description, assignee_id, owner_user_id, status, progress_percent, sort_order)
SELECT 'DEPT', 2026, 3, NULL, 'Bảo trì hệ thống PCCC', 'Kiểm tra, bảo trì định kỳ hệ thống phòng cháy chữa cháy toàn trường', m.id, 1, 'DANG_LAM', 40, 2
FROM members m WHERE m.email = 'tranthib@vnkgu.edu.vn';

INSERT INTO tasks (scope, year, quarter, month, title, description, assignee_id, owner_user_id, status, progress_percent, sort_order)
SELECT 'PERSONAL', 2026, NULL, 8, 'Theo dõi báo giá máy chiếu', 'Tổng hợp báo giá thiết bị máy chiếu từ các đơn vị cung cấp', m.id, 1, 'DANG_LAM', 20, 1
FROM members m WHERE m.email = 'nguyenvana@vnkgu.edu.vn';

INSERT INTO tasks (scope, year, quarter, month, title, description, assignee_id, owner_user_id, status, progress_percent, sort_order)
SELECT 'DEPT', 2026, 3, NULL, 'Trồng bổ sung cây xanh khu B', 'Trồng bổ sung 50 cây xanh cải thiện cảnh quan khuôn viên khu B', m.id, 1, 'HOAN_THANH', 100, 3
FROM members m WHERE m.email = 'tranthib@vnkgu.edu.vn';

INSERT INTO tasks (scope, year, quarter, month, title, description, assignee_id, owner_user_id, status, progress_percent, sort_order)
SELECT 'DEPT', 2026, 4, NULL, 'Chuẩn bị cơ sở vật chất khai giảng năm học 2026-2027', 'Rà soát, chuẩn bị phòng học, trang thiết bị phục vụ khai giảng', m.id, 1, 'CHUA_BAT_DAU', 0, 4
FROM members m WHERE m.email = 'nguyenvana@vnkgu.edu.vn';

INSERT INTO task_steps (task_id, title, status, note, sort_order)
SELECT t.id, s.title, s.status, NULL, s.sort_order
FROM tasks t
JOIN (VALUES
    ('Cải tạo dãy phòng học B', 'Khảo sát hiện trạng', 'HOAN_THANH', 1),
    ('Cải tạo dãy phòng học B', 'Lập dự toán', 'HOAN_THANH', 2),
    ('Cải tạo dãy phòng học B', 'Thi công sửa chữa', 'HOAN_THANH', 3),
    ('Cải tạo dãy phòng học B', 'Nghiệm thu bàn giao', 'HOAN_THANH', 4),
    ('Bảo trì hệ thống PCCC', 'Lập kế hoạch bảo trì', 'HOAN_THANH', 1),
    ('Bảo trì hệ thống PCCC', 'Kiểm tra thiết bị tòa A, B', 'DANG_LAM', 2),
    ('Bảo trì hệ thống PCCC', 'Kiểm tra thiết bị tòa C, khu ký túc xá', 'CHUA_BAT_DAU', 3),
    ('Theo dõi báo giá máy chiếu', 'Gửi thư mời báo giá', 'HOAN_THANH', 1),
    ('Theo dõi báo giá máy chiếu', 'Tổng hợp báo giá', 'DANG_LAM', 2)
) AS s(task_title, title, status, sort_order) ON s.task_title = t.title AND t.year = 2026;

INSERT INTO reports (period_type, period_id, year, sections, ai_provider, ai_generated_at, updated_by) VALUES
    ('MONTH', '2026-M7', 2026, '{"muc1":"Trong tháng 7/2026, Phòng Quản trị Cơ sở vật chất duy trì hoạt động ổn định, đảm bảo cơ sở vật chất phục vụ giảng dạy và làm việc.","muc2":"Ban lãnh đạo phòng đã chỉ đạo sát sao công tác cải tạo dãy phòng học B và xây dựng kế hoạch bảo trì PCCC quý III.","muc3.xay_dung":"Hoàn thành nghiệm thu cải tạo dãy phòng học B: thay mới 120 bộ bàn ghế, cải tạo hệ thống chiếu sáng 12 phòng học, sơn sửa toàn bộ mặt tiền và hành lang.","muc3.mang_muasam":"Triển khai mời báo giá thiết bị máy chiếu phòng học (30 bộ), hạn nhận báo giá 15/08/2026.","muc3.canh_quan":"Trồng bổ sung 50 cây xanh tại khuôn viên khu B, cắt tỉa cây xanh toàn trường.","muc3.phoi_hop":"Phối hợp Khoa Công nghệ thông tin xử lý đề nghị sửa chữa hệ thống điều hòa.","muc4":"Tham gia các hoạt động đoàn thể chào mừng năm học mới cùng Đoàn Thanh niên nhà trường.","muc5":"Tiếp tục triển khai kế hoạch bảo trì PCCC quý III/2026 và chuẩn bị cơ sở vật chất phục vụ khai giảng năm học 2026-2027."}'::jsonb, NULL, NULL, 1),
    ('QUARTER', '2026-Q2', 2026, '{"muc1":"Quý II/2026, Phòng Quản trị Cơ sở vật chất hoàn thành tốt các nhiệm vụ được giao, đảm bảo điều kiện cơ sở vật chất phục vụ năm học.","muc2":"Ban giám hiệu và lãnh đạo phòng đã chỉ đạo triển khai đồng bộ công tác sửa chữa, bảo trì và mua sắm trang thiết bị.","muc3.xay_dung":"Triển khai sửa chữa, cải tạo 3 hạng mục công trình gồm dãy phòng học B, hệ thống điện tòa A và mái tôn nhà đa năng.","muc3.mang_muasam":"Bảo trì định kỳ hệ thống mạng nội bộ, thực hiện kiểm kê tài sản cố định 6 tháng đầu năm.","muc3.canh_quan":"Duy trì công tác vệ sinh, cắt tỉa cây xanh, chăm sóc cảnh quan toàn trường theo lịch hàng tuần.","muc3.phoi_hop":"Phối hợp các khoa, phòng ban xử lý 15 đề nghị sửa chữa, bảo trì phát sinh trong quý.","muc4":"Tham gia đầy đủ các phong trào đoàn thể, hoạt động thiện nguyện do Công đoàn trường phát động.","muc5":"Quý III/2026 tập trung hoàn thành bảo trì PCCC toàn trường và chuẩn bị cơ sở vật chất khai giảng."}'::jsonb, NULL, NULL, 1);
