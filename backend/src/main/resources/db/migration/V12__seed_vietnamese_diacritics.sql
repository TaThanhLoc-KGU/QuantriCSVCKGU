-- V8 seed ban dau go khong dau (vd "Tin hoat dong") - sua lai co dau day du,
-- dung UPDATE theo slug/code on dinh thay vi sua V8 (Flyway da ap dung V8,
-- sua truc tiep se vo checksum).

UPDATE categories SET name = 'Tin hoạt động', description = 'Tin tức hoạt động của Phòng Quản trị Cơ sở vật chất'
    WHERE slug = 'tin-hoat-dong' AND kind = 'POST';
UPDATE categories SET name = 'Công khai', description = 'Công khai mua sắm, đấu thầu, tài sản'
    WHERE slug = 'cong-khai' AND kind = 'POST';
UPDATE categories SET name = 'Biểu mẫu chung', description = 'Biểu mẫu dùng chung của phòng'
    WHERE slug = 'bieu-mau-chung' AND kind = 'FORM';

UPDATE document_types SET name = 'Báo cáo' WHERE code = 'BC';
UPDATE document_types SET name = 'Quyết định' WHERE code = 'QD';
UPDATE document_types SET name = 'Kế hoạch' WHERE code = 'KH';
UPDATE document_types SET name = 'Hợp đồng' WHERE code = 'HD';
UPDATE document_types SET name = 'Tờ trình' WHERE code = 'TTR';
UPDATE document_types SET name = 'Đề nghị' WHERE code = 'DN';
UPDATE document_types SET name = 'Công văn đi' WHERE code = 'CV';
UPDATE document_types SET name = 'Tiếp nhận đề nghị đơn vị khác' WHERE code = 'DN_DEN';

UPDATE members SET name = 'Nguyễn Văn A', position = 'Trưởng phòng' WHERE email = 'nguyenvana@vnkgu.edu.vn';
UPDATE members SET name = 'Trần Thị B', position = 'Chuyên viên' WHERE email = 'tranthib@vnkgu.edu.vn';

UPDATE users SET full_name = 'Quản trị hệ thống' WHERE username = 'admin';

UPDATE system_settings SET value = 'Trường Đại học Kiên Giang' WHERE key = 'org.name';
UPDATE system_settings SET value = 'Phòng Quản trị Cơ sở vật chất' WHERE key = 'org.dept';
