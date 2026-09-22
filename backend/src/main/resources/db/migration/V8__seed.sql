-- Seed toi thieu: tai khoan ADMIN, nhan su mau, loai van ban mac dinh,
-- danh muc mau, cau hinh he thong mac dinh.
-- Ghi chu: seed.mjs cua repo cu (QuantriCSVCKGU) chua co trong repo nay;
-- khi co du lieu lich su se bo sung bang migration/script rieng.

-- ADMIN mac dinh: username=admin, password=admin123 (BCrypt) -> DOI NGAY sau khi trien khai
INSERT INTO users (username, email, full_name, password_hash, auth_provider, role, active)
VALUES (
    'admin',
    'admin@vnkgu.edu.vn',
    'Quan tri he thong',
    '$2b$10$2SgdXVRYB24cA.4.BFDvBOZbcp/wVoA.SdH7e2fMMunOOFRA/jBOa',
    'LOCAL',
    'ADMIN',
    TRUE
);

-- Nhan su mau (Member) - dung lam nguoi phu trach nhiem vu
INSERT INTO members (name, position, email, phone, active, sort_order) VALUES
    ('Nguyen Van A', 'Truong phong', 'nguyenvana@vnkgu.edu.vn', NULL, TRUE, 1),
    ('Tran Thi B', 'Chuyen vien', 'tranthib@vnkgu.edu.vn', NULL, TRUE, 2);

-- DocumentType mac dinh (spec 3.3)
INSERT INTO document_types (code, name, symbol_code, direction, reset_yearly, sort_order, active) VALUES
    ('BC', 'Bao cao', 'BC-QTCSVC', 'OUTGOING', TRUE, 1, TRUE),
    ('QD', 'Quyet dinh', 'QD-QTCSVC', 'OUTGOING', TRUE, 2, TRUE),
    ('KH', 'Ke hoach', 'KH-QTCSVC', 'OUTGOING', TRUE, 3, TRUE),
    ('HD', 'Hop dong', 'HD-QTCSVC', 'OUTGOING', TRUE, 4, TRUE),
    ('TTR', 'To trinh', 'TTr-QTCSVC', 'OUTGOING', TRUE, 5, TRUE),
    ('DN', 'De nghi', 'DN-QTCSVC', 'OUTGOING', TRUE, 6, TRUE),
    ('CV', 'Cong van di', 'DHKG-QTCSVC', 'OUTGOING', TRUE, 7, TRUE),
    ('DN_DEN', 'Tiep nhan de nghi don vi khac', 'DN-DEN', 'INCOMING', TRUE, 8, TRUE);

-- Danh muc mau (Category) - POST va FORM
INSERT INTO categories (name, slug, kind, parent_id, sort_order, description) VALUES
    ('Tin hoat dong', 'tin-hoat-dong', 'POST', NULL, 1, NULL),
    ('Cong khai', 'cong-khai', 'POST', NULL, 2, NULL),
    ('Bieu mau chung', 'bieu-mau-chung', 'FORM', NULL, 1, NULL);

-- Cau hinh he thong mac dinh
INSERT INTO system_settings (key, value) VALUES
    ('ai.provider', 'none'),
    ('sso.allowedDomains', 'vnkgu.edu.vn'),
    ('org.name', 'Truong (cap nhat trong Settings)'),
    ('org.dept', 'Phong Quan tri Co so vat chat');
