-- Nhap du lieu thuc te xin so To trinh / De nghi / Bao cao tham dinh nam 2026
-- Nguon: file excel 'Xin so To trinh, Cong van, De nghi - 2026.xlsx' nguoi dung cung cap.
-- them loai van ban moi 'Bao cao tham dinh' (BCTD) - chua co trong seed ban dau.

INSERT INTO document_types (code, name, symbol_code, direction, reset_yearly, sort_order, active) VALUES
    ('BCTD', 'Báo cáo thẩm định', 'BCTĐ-QTCSVC', 'OUTGOING', TRUE, 9, TRUE);

-- To trinh (67 dong)
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 1, LPAD('1', 2, '0') || '/' || dt.symbol_code, 'TT Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thi công lắp đặt hệ thống ống nước phục vụ tưới cây trong khuôn viên trường', 'Hiền', DATE '2026-01-19', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 2, LPAD('2', 2, '0') || '/' || dt.symbol_code, 'TT Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thi công lắp đặt hệ thống ống nước phục vụ tưới cây trong khuôn viên trường', 'Hiền', DATE '2026-01-19', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 3, LPAD('3', 2, '0') || '/' || dt.symbol_code, 'TT Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thi công sân nền, vỉa hè trước nhà đa năng', 'Hiền', DATE '2026-01-27', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 4, LPAD('4', 2, '0') || '/' || dt.symbol_code, 'TT Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thi công sân nền, vỉa hè trước nhà đa năng', 'Hiền', DATE '2026-01-27', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 5, LPAD('5', 2, '0') || '/' || dt.symbol_code, 'TT Phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', 'Hảo', DATE '2026-01-28', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 6, LPAD('6', 2, '0') || '/' || dt.symbol_code, 'TT Phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', 'Hảo', DATE '2026-01-28', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 7, LPAD('7', 2, '0') || '/' || dt.symbol_code, 'phê duyệt dự toán và kế hoạch lựa chọn nhà thầu Mua Tivi trang bị các phòng học của Trường Đại học Kiên Giang', 'Luân', DATE '2026-01-29', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 8, LPAD('8', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn đơn vị Cung cấp Tivi trang bị các phòng học của Trường Đại học Kiên Giang', 'Luân', DATE '2026-02-02', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 9, LPAD('9', 2, '0') || '/' || dt.symbol_code, 'phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', 'Hảo', DATE '2026-02-03', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 10, LPAD('10', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn nhà thầu gói thầu: Thông nghẹt bồn cầu các nhà vệ sinh trong các nhà học và ký túc xá', 'Hảo', DATE '2026-02-03', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 11, LPAD('11', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-02-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 12, LPAD('12', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-02-11', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 13, LPAD('13', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-02-23', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 14, LPAD('14', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-02-23', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 15, LPAD('15', 2, '0') || '/' || dt.symbol_code, 'phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Sửa chữa Lát gạch sân nền, hành lang nhà điều hành trung tâm bị bong tróc', 'Hảo', DATE '2026-02-25', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 16, LPAD('16', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', 'Hảo', DATE '2026-02-25', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 17, LPAD('17', 2, '0') || '/' || dt.symbol_code, 'Về việc bổ sung nhân sự tại Phòng Quản trị cơ sở vật chất', NULL, DATE '2026-02-25', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 18, LPAD('18', 2, '0') || '/' || dt.symbol_code, 'tờ trình phê duyệt chủ trương sửa chữa bảo dưỡng nhà A', 'Hiền', DATE '2026-02-27', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 19, LPAD('19', 2, '0') || '/' || dt.symbol_code, 'tờ trình phê duyệt kế hoạch lựa chọn các gói thầu chuẩn bị đầu tư sửa chữa bảo dưỡng nhà A', 'Hiền', DATE '2026-02-27', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 20, LPAD('20', 2, '0') || '/' || dt.symbol_code, 'phê duyệt dự toán và kế hoạch lựa chọn nhà thầu Mua sắm thiết bị trực tuyến lắp đặt tại phòng họp của Trường Đại học Kiên Giang', 'Luân', DATE '2026-03-02', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 21, LPAD('21', 2, '0') || '/' || dt.symbol_code, 'tờ trình pd lựa chọn đơn vị lập báo cáo KTKT cải tạo nhà A', 'Hiền', DATE '2026-03-03', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 22, LPAD('22', 2, '0') || '/' || dt.symbol_code, 'tờ trình pd lựa chọn đơn vị thẩm tra báo cáo KTKT cải tạo nhà A', NULL, DATE '2026-03-03', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 23, LPAD('23', 2, '0') || '/' || dt.symbol_code, 'Tờ trình về việc đề nghị ký hợp đồng thuê khoán dịch vụ tạp vụ', NULL, DATE '2026-03-03', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 24, LPAD('24', 2, '0') || '/' || dt.symbol_code, 'Tờ trình về việc đề nghị chuyển hợp đồng thuê khoán dịch vụ tạp vụ sang hợp đồng thuê khoán dịch vụ cây xanh', NULL, DATE '2026-03-03', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 25, LPAD('25', 2, '0') || '/' || dt.symbol_code, 'Phê duyệt dự toán và KHLCNT Mua trang phuc an ninh quốc phòng cho sinh viên', 'Hảo', DATE '2026-03-09', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 26, LPAD('26', 2, '0') || '/' || dt.symbol_code, 'Phê duyệt LCNT Mua trang phuc an ninh quốc phòng cho sinh viên', 'Hảo', DATE '2026-03-09', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 27, LPAD('27', 2, '0') || '/' || dt.symbol_code, 'tờ trình phê duyệt chủ trương xây dựng nhà thực hành cơ khí', 'Hiền', DATE '2026-03-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 28, LPAD('28', 2, '0') || '/' || dt.symbol_code, 'tờ trình phê duyệt kế hoạch lựa chọn các gói thầu chuẩn bị đầu tư xây dựng nhà thực hành cơ khí', 'Hiền', DATE '2026-03-11', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 29, LPAD('29', 2, '0') || '/' || dt.symbol_code, 'phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu mua sắm lắp đặt thiết bị Internet tại nhà ĐHTT', 'Lộc', DATE '2026-03-12', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 30, LPAD('30', 2, '0') || '/' || dt.symbol_code, 'tờ trình pd lựa chọn đơn vị lập báo cáo KTKT xd nhà xưởng thực hành', NULL, DATE '2026-03-12', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 31, LPAD('31', 2, '0') || '/' || dt.symbol_code, 'tờ trình pd lựa chọn đơn vị thẩm tra báo cáo KTKT xd nhà xưởng thực hành', NULL, DATE '2026-03-12', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 32, LPAD('32', 2, '0') || '/' || dt.symbol_code, 'Tờ trình về việc phê duyệt kết quả lựa chọn nhà thầy gói thầu mua sắm, lắp đặt thiết bị internet tại nhà điều hành trung tâm', 'Lộc', DATE '2026-03-18', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 33, LPAD('33', 2, '0') || '/' || dt.symbol_code, 'phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt và di dời phòng làm việc theo đề nghị của các phòng khoa và trung tâm', 'Hảo', DATE '2026-03-25', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 34, LPAD('34', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt và di dời phòng làm việc theo đề nghị của các phòng khoa và trung tâm', 'Hảo', DATE '2026-03-25', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 35, LPAD('35', 2, '0') || '/' || dt.symbol_code, 'đề nghị tiếp tục ký hợp đồng lao động', NULL, DATE '2026-03-25', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 36, LPAD('36', 2, '0') || '/' || dt.symbol_code, 'phe duyệt dự toán và kế hoạch lựa chọn nhà thầu gói sửa chữa phòng đọc sách thư viện ĐHKG', 'Hiền', DATE '2026-04-08', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 37, LPAD('37', 2, '0') || '/' || dt.symbol_code, 'phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt thiết bị các tòa nhà Ký túc xá, nhà B, C, Trung tâm thông tin thư viện theo đề nghị của các phòng khoa', 'Hảo', DATE '2026-04-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 38, LPAD('38', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn nhà thầu gói thầu: Sửa chữa, lắp đặt thiết bị các tòa nhà Ký túc xá, nhà B, C, Trung tâm thông tin thư viện theo đề nghị của các phòng khoa', 'Hảo', DATE '2026-04-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 39, LPAD('39', 2, '0') || '/' || dt.symbol_code, 'phê duyệt dự toán và kế hoạch lựa chọn nhà thầu Mua sắm dụng cụ phục vụ giảng dạy giáo dục thể chất – Quốc phòng an ninh của Trường Đại học Kiên Giang', 'Luân', DATE '2026-04-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 40, LPAD('40', 2, '0') || '/' || dt.symbol_code, 'phê duyệt dự toán và kế hoạch lựa chọn các gói thầu công trình bảo dưỡng sửa chữa nhà A', 'Hiền', DATE '2026-04-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 41, LPAD('41', 2, '0') || '/' || dt.symbol_code, 'phe duyệt báo cáo kinh tế kỹ thuật công trình xây dựng xưởng thực hành cơ khí', 'Hiền', DATE '2026-04-14', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 42, LPAD('42', 2, '0') || '/' || dt.symbol_code, 'phe duyệt lựa chọn nhà thầu thi công cải tạo nội thất phòng đọc sách thư viện ĐHKG', 'Hiền', DATE '2026-04-14', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 43, LPAD('43', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn đơn vị lập hsmt ctr bảo dưỡng sửa chữa nhà A', 'Hiền', DATE '2026-04-15', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 44, LPAD('44', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn đơn vị lập thẩm định kế quả thi công ctr bảo dưỡng sửa chữa nhà A', 'Hiền', DATE '2026-04-15', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 45, LPAD('45', 2, '0') || '/' || dt.symbol_code, 'phê duyệt dự toán và kế hoạch lựa chọn nhà thầu Mua dụng cụ vật tư và nguyên liệu cho Trung tâm Học liệu - Thực hành phục vụ cho thực hành học kỳ 3 năm học 2025-2026 của Trường Đại học Kiên Giang', 'Luân', DATE '2026-04-15', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 46, LPAD('46', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn đơn vị Cung cấp dụng cụ phục vụ giảng dạy giáo dục thể chất – Quốc phòng an ninh của Trường Đại học Kiên Giang', 'Luân', DATE '2026-04-15', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 47, LPAD('47', 2, '0') || '/' || dt.symbol_code, 'phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu Lắp đặt trang bị phòng xét xử phục vụ học tập và giảng dạy cho sinh viên ngành Luật của Trường Đại học Kiên Giang', 'Luân', DATE '2026-04-16', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 48, LPAD('48', 2, '0') || '/' || dt.symbol_code, 'phê duyệt Dự toán và Kế hoạch lựa chọn nhà thầu gói thầu cải tạo nạo vét bùn cống thoát nước nhà a,b,c, ktx2,3', 'Hiền', DATE '2026-04-17', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 49, LPAD('49', 2, '0') || '/' || dt.symbol_code, 'phê duyệt lựa chọn nhà thầu gói thầu cải tạo nạo vét bùn cống thoát nước nhà a,b,c, ktx2,3', 'Hiền', DATE '2026-04-20', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 50, LPAD('50', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn đơn vị Cung cấp dụng cụ vật tư và nguyên liệu cho Trung tâm Học liệu - Thực hành phục vụ cho thực hành học kỳ 3 năm học 2025-2026 của Trường Đại học Kiên Giang', 'Luân', DATE '2026-04-20', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 51, LPAD('51', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn nhà thầu gói thầu Lắp đặt trang bị phòng xét xử phục vụ học tập và giảng dạy cho sinh viên ngành Luật của Trường Đại học Kiên Giang', 'Luân', DATE '2026-04-22', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 52, LPAD('52', 2, '0') || '/' || dt.symbol_code, 'phe duyệt E-HSMT gói thầu thi công xây dựng công trình bảo dưỡng sửa chữa nhà A', 'Hiền', DATE '2026-04-23', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 53, LPAD('53', 2, '0') || '/' || dt.symbol_code, 'TỜ TRÌNH Về kết quả đánh giá thời gian thử việc Đề nghị tiếp tục thực hiện hợp đồng lao động đã ký', 'Lộc', DATE '2026-04-24', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 54, LPAD('54', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kế hoạch lựa chọn các gói thầu thuộc công trình xây dựng xưởng thực hành cơ khí', 'Hiền', DATE '2026-04-28', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 55, LPAD('55', 2, '0') || '/' || dt.symbol_code, 'Tờ trình ký hợp đồng lao động cho nhân viên tạp vụ Bích Trâm', 'Tuấn', DATE '2026-04-28', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 56, LPAD('56', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn đơn vị lập hsmt ctr cải tạo sửa chữa xưởng thực hành cơ khí', 'Hiền', DATE '2026-05-05', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 57, LPAD('57', 2, '0') || '/' || dt.symbol_code, 'phê duyệt e- hsmt ctr cải tạo sửa chữa xưởng thực hành cơ khí', 'Hiền', DATE '2026-05-12', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 58, LPAD('58', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-05-19', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 59, LPAD('59', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-05-19', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 60, LPAD('60', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-06-08', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 61, LPAD('61', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-06-09', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 62, LPAD('62', 2, '0') || '/' || dt.symbol_code, 'Phê duyệt kết quả lựa chọn nhà thầu xây dựng bảo dưỡng sửa chữa nhà A', NULL, DATE '2026-06-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 63, LPAD('63', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-06-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 64, LPAD('64', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-06-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 65, LPAD('65', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn nhà thầu gói thầu thi công nhà xưởng thực hành cơ khí', 'Hiền', DATE '2026-06-24', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 66, LPAD('66', 2, '0') || '/' || dt.symbol_code, 'phê duyệt kết quả lựa chọn nhà thầu gói thầu giám sát thi công nhà xưởng thực hành cơ khí', 'Hiền', DATE '2026-06-24', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 67, LPAD('67', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', NULL, DATE '2026-07-01', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'TTR';

-- De nghi (18 dong)
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 15, LPAD('15', 2, '0') || '/' || dt.symbol_code, 'Sửa chữa Lát gạch sân nền, hành lang nhà điều hành trung tâm bị bong tróc', 'Hảo', DATE '2026-02-22', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 20, LPAD('20', 2, '0') || '/' || dt.symbol_code, 'Sửa chứ lắp đặt di dời theo đề nghị của các phòng khoa', 'Hảo', DATE '2026-03-09', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 20, LPAD('20', 2, '0') || '/' || dt.symbol_code, 'Thuê xe đi vận chuyển xe về đơn vị', 'Luân', DATE '2026-03-12', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 21, LPAD('21', 2, '0') || '/' || dt.symbol_code, 'Sửa chữa Bộ lưu điện UPS', NULL, DATE '2026-03-24', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 22, LPAD('22', 2, '0') || '/' || dt.symbol_code, 'Sửa chữa các tòa nhà', 'Hảo', DATE '2026-03-25', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 23, LPAD('23', 2, '0') || '/' || dt.symbol_code, 'sửa chữa cải tạo phòng nội thất thư viện', 'Hiền', DATE '2026-04-03', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 24, LPAD('24', 2, '0') || '/' || dt.symbol_code, 'Mua sắm công cụ dụng cụ vệ sinh trường quý 2 2026', 'Hiền', DATE '2026-04-06', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 25, LPAD('25', 2, '0') || '/' || dt.symbol_code, 'Sửa máy in trong trường', 'Nhơn', DATE '2026-04-09', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 25, LPAD('25', 2, '0') || '/' || dt.symbol_code, 'Mua camera an ninh phục vụ công tác giám sát phục vụ các kỳ thi', 'Lộc', DATE '2026-04-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 26, LPAD('26', 2, '0') || '/' || dt.symbol_code, 'Thuê mướn đơn vị diệt trừ mối', 'Hảo', DATE '2026-04-10', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 27, LPAD('27', 2, '0') || '/' || dt.symbol_code, 'Cải tạo nạo vét bùn cống thoát nước nhà a,b,c ktx 2,3', 'Hiền', DATE '2026-04-14', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 28, LPAD('28', 2, '0') || '/' || dt.symbol_code, 'Mua HDD và USB cho 2 máy bảo mật', 'Lộc', DATE '2026-05-05', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 29, LPAD('29', 2, '0') || '/' || dt.symbol_code, 'sua camera, bang ten', 'k', DATE '2026-05-13', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 30, LPAD('30', 2, '0') || '/' || dt.symbol_code, '(Không ghi rõ nội dung trong sổ theo dõi)', 'Hảo', DATE '2026-06-02', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 31, LPAD('31', 2, '0') || '/' || dt.symbol_code, 'Mua Dây HDMI', 'Lộc', DATE '2026-06-22', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 32, LPAD('32', 2, '0') || '/' || dt.symbol_code, 'Mua gói tăng tường chatbot', 'Lộc', DATE '2026-07-08', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 33, LPAD('33', 2, '0') || '/' || dt.symbol_code, 'Mua dụng cụ sửa mạng', 'Lộc', DATE '2026-07-16', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 34, LPAD('34', 2, '0') || '/' || dt.symbol_code, 'Bào trì máy lạnh nhà điều hành', 'Hảo', DATE '2026-07-16', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'DN';

-- Bao cao tham dinh (2 dong)
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 1, LPAD('1', 2, '0') || '/' || dt.symbol_code, 'báo cáo thẩm định công trình bảo dưỡng sửa chữa nhà A', 'Hiền', DATE '2026-04-01', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'BCTD';
INSERT INTO document_numbers (document_type_id, year, number_int, number_display, title, person, issue_date, note, sender_unit, original_ref, received_date, created_by)
SELECT dt.id, 2026, 2, LPAD('2', 2, '0') || '/' || dt.symbol_code, 'báo cáo thẩm định công trình xây dựng nhà xưởng thực hành cơ khí', 'Hiền', DATE '2026-04-14', NULL, NULL, NULL, NULL, 1
FROM document_types dt WHERE dt.code = 'BCTD';
