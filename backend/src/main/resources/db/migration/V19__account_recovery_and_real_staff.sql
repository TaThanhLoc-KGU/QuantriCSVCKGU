-- Vo hieu hoa 2 nhan su mau (fake) da seed tu V8, thay bang danh sach that
-- cua Phong Quan tri Co so vat chat. Khong xoa hang (tranh vi pham FK tu
-- users.member_id / tasks.assignee_id neu da co du lieu tham chieu).
UPDATE members SET active = FALSE
WHERE email IN ('nguyenvana@vnkgu.edu.vn', 'tranthib@vnkgu.edu.vn');

-- Sua ten sai (nhap nham "Nguyen" thay vi "Le") tren ban ghi da co san,
-- neu ton tai - truoc khi ap dung cac UPDATE/INSERT ben duoi theo ten dung.
UPDATE members SET name = 'Lê Khắc Hảo' WHERE name = 'Nguyễn Khắc Hảo';

-- Bo sung "to" (nhom cong tac) + email cho tung nguoi. Dung UPDATE cho
-- nhung nguoi da co san trong DB, va INSERT ... WHERE NOT EXISTS cho moi
-- truong chua co du lieu nhan su nay (vd production truoc khi migration
-- nay chay) - de idempotent va an toan chay lai o ca 2 truong hop.
UPDATE members SET position = 'Phó Trưởng phòng phụ trách', email = 'tdluan@vnkgu.edu.vn' WHERE name = 'Tiêu Đình Luân';
UPDATE members SET position = 'Chuyên viên (Tổ Cảnh quan, cây xanh và vệ sinh)', email = 'hqtuan@vnkgu.edu.vn' WHERE name = 'Huỳnh Quốc Tuấn';
UPDATE members SET position = 'Chuyên viên (Tổ Cảnh quan, cây xanh và vệ sinh)', email = 'thtran@vnkgu.edu.vn' WHERE name = 'Trần Huyền Trân';
UPDATE members SET position = 'Chuyên viên (Tổ Sửa chữa, xây dựng)', email = 'lhhien@vnkgu.edu.vn' WHERE name = 'Lư Hữu Hiền';
UPDATE members SET position = 'Chuyên viên (Tổ Sửa chữa, xây dựng)', email = 'nkhao@vnkgu.edu.vn' WHERE name = 'Lê Khắc Hảo';
UPDATE members SET position = 'Chuyên viên (Tổ Quản lý tài sản và Công nghệ thông tin)', email = 'tnvnhon@vnkgu.edu.vn' WHERE name = 'Trần Ngọc Vĩnh Nhơn';
UPDATE members SET position = 'Chuyên viên (Tổ Quản lý tài sản và Công nghệ thông tin)', email = 'ttloc@vnkgu.edu.vn' WHERE name = 'Tạ Thành Lộc';
UPDATE members SET position = 'Chuyên viên (Tổ Quản lý tài sản và Công nghệ thông tin)', email = 'ldkhanh@vnkgu.edu.vn' WHERE name = 'Lê Duy Khánh';

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Tiêu Đình Luân', 'Phó Trưởng phòng phụ trách', 'tdluan@vnkgu.edu.vn', TRUE, 1
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Tiêu Đình Luân');

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Huỳnh Quốc Tuấn', 'Chuyên viên (Tổ Cảnh quan, cây xanh và vệ sinh)', 'hqtuan@vnkgu.edu.vn', TRUE, 2
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Huỳnh Quốc Tuấn');

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Trần Huyền Trân', 'Chuyên viên (Tổ Cảnh quan, cây xanh và vệ sinh)', 'thtran@vnkgu.edu.vn', TRUE, 3
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Trần Huyền Trân');

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Lư Hữu Hiền', 'Chuyên viên (Tổ Sửa chữa, xây dựng)', 'lhhien@vnkgu.edu.vn', TRUE, 4
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Lư Hữu Hiền');

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Lê Khắc Hảo', 'Chuyên viên (Tổ Sửa chữa, xây dựng)', 'nkhao@vnkgu.edu.vn', TRUE, 5
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Lê Khắc Hảo');

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Trần Ngọc Vĩnh Nhơn', 'Chuyên viên (Tổ Quản lý tài sản và Công nghệ thông tin)', 'tnvnhon@vnkgu.edu.vn', TRUE, 6
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Trần Ngọc Vĩnh Nhơn');

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Tạ Thành Lộc', 'Chuyên viên (Tổ Quản lý tài sản và Công nghệ thông tin)', 'ttloc@vnkgu.edu.vn', TRUE, 7
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Tạ Thành Lộc');

INSERT INTO members (name, position, email, active, sort_order)
SELECT 'Lê Duy Khánh', 'Chuyên viên (Tổ Quản lý tài sản và Công nghệ thông tin)', 'ldkhanh@vnkgu.edu.vn', TRUE, 8
WHERE NOT EXISTS (SELECT 1 FROM members WHERE name = 'Lê Duy Khánh');

-- Yeu cau khoi phuc tai khoan he thong (sinh vien gui qua form cong khai,
-- phong xu ly thu cong dua vao anh/CCCD dinh kem - spec: module rieng
-- accountrecovery, khong lien quan module identity/users).
CREATE TABLE account_recovery_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name TEXT NOT NULL,
    is_new_student BOOLEAN NOT NULL,
    student_id TEXT NOT NULL,
    cccd_number TEXT,
    class_code TEXT,
    unit_name TEXT,
    screenshot_url TEXT,
    screenshot_name TEXT,
    id_card_url TEXT,
    id_card_name TEXT,
    status TEXT NOT NULL DEFAULT 'MOI' CHECK (status IN ('MOI', 'DA_XU_LY', 'TU_CHOI')),
    admin_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    processed_by BIGINT REFERENCES users(id)
);

CREATE INDEX idx_account_recovery_status ON account_recovery_requests(status);
CREATE INDEX idx_account_recovery_created ON account_recovery_requests(created_at DESC);
