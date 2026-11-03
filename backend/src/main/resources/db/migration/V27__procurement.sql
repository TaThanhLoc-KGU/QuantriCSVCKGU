-- Mua sam van phong pham theo dot (quy): don vi tu nhap, admin tong hop + xuat Excel.
-- audience: PHONG (cac phong ban) hoac KHOA - moi doi tuong co danh muc + danh sach don vi rieng.

CREATE TABLE procurement_units (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    audience TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (audience, code)
);

CREATE TABLE procurement_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    audience TEXT NOT NULL,
    code TEXT NOT NULL,
    group_name TEXT NOT NULL DEFAULT 'Khác',
    name TEXT NOT NULL,
    unit_label TEXT NOT NULL DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (audience, code)
);

CREATE TABLE procurement_rounds (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    audience TEXT NOT NULL,
    name TEXT NOT NULL,
    deadline TIMESTAMPTZ,
    accepting BOOLEAN NOT NULL DEFAULT TRUE,
    show_previous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE procurement_submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    round_id BIGINT NOT NULL REFERENCES procurement_rounds (id) ON DELETE CASCADE,
    unit_id BIGINT NOT NULL REFERENCES procurement_units (id),
    general_note TEXT,
    times_saved INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (round_id, unit_id)
);

CREATE TABLE procurement_lines (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES procurement_submissions (id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    unit_label TEXT NOT NULL DEFAULT '',
    qty INT NOT NULL,
    note TEXT
);

CREATE INDEX procurement_lines_submission_idx ON procurement_lines (submission_id);

-- Du lieu ban dau: danh sach don vi + danh muc VPP cua cac phong (tu file VPP_DuLieu_WebApp.xlsx).

INSERT INTO procurement_units (audience, code, name, sort_order) VALUES
    ('PHONG', 'HTKHCN', 'HT&KHCN', 1),
    ('PHONG', 'TCNS', 'TCNS', 2),
    ('PHONG', 'DBCL', 'ĐBCL&TTPC', 3),
    ('PHONG', 'QTCSVC', 'Quản trị CSVC', 4),
    ('PHONG', 'CTSV', 'CTSV&KN', 5),
    ('PHONG', 'KHTC', 'KH-TC', 6),
    ('PHONG', 'DAOTAO', 'Đào tạo', 7),
    ('PHONG', 'VANPHONG', 'Văn phòng', 8);

INSERT INTO procurement_items (audience, code, group_name, name, unit_label, sort_order, visible) VALUES
    ('PHONG', 'VPP001', 'Giấy & bìa in', 'Giấy A4 định lượng 70', 'Thùng', 1, TRUE),
    ('PHONG', 'VPP002', 'Giấy & bìa in', 'Giấy A4 định lượng 80', 'Thùng', 2, TRUE),
    ('PHONG', 'VPP003', 'Giấy & bìa in', 'Giấy A4 định lượng 100', 'Gram', 3, TRUE),
    ('PHONG', 'VPP004', 'Giấy & bìa in', 'Bìa A4 cứng trắng (Định lượng 180)', 'Xấp', 4, TRUE),
    ('PHONG', 'VPP005', 'Giấy & bìa in', 'Bìa A4 cứng bóng 2 mặt (Định lượng 260)', 'Xấp', 5, TRUE),
    ('PHONG', 'VPP006', 'Giấy & bìa in', 'Bìa cứng xanh dương (định lượng 180)', 'Xấp', 6, TRUE),
    ('PHONG', 'VPP007', 'Giấy & bìa in', 'Giấy A4 ford màu ĐL 80', 'Gram', 7, TRUE),
    ('PHONG', 'VPP008', 'Giấy & bìa in', 'Bìa kiếng A4', 'Xấp', 8, TRUE),
    ('PHONG', 'VPP009', 'Bút viết & bút xóa', 'Viết bi TL-095', 'Hộp', 9, TRUE),
    ('PHONG', 'VPP010', 'Bút viết & bút xóa', 'Viết bi TL-036', 'Hộp', 10, TRUE),
    ('PHONG', 'VPP011', 'Bút viết & bút xóa', 'Viết bi TL-031', 'Cây', 11, TRUE),
    ('PHONG', 'VPP012', 'Bút viết & bút xóa', 'Viết bi FO-03', 'Hộp', 12, TRUE),
    ('PHONG', 'VPP013', 'Bút viết & bút xóa', 'Viết cắm bàn', 'Cặp', 13, TRUE),
    ('PHONG', 'VPP014', 'Bút viết & bút xóa', 'Viết chì 6B', 'Cây', 14, TRUE),
    ('PHONG', 'VPP015', 'Bút viết & bút xóa', 'Viết chì 2B', 'Hộp', 15, TRUE),
    ('PHONG', 'VPP016', 'Bút viết & bút xóa', 'Gôm', 'Cục', 16, TRUE),
    ('PHONG', 'VPP017', 'Giấy ghi chú', 'Giấy note 3x3', 'Xấp', 17, TRUE),
    ('PHONG', 'VPP018', 'Giấy ghi chú', 'Giấy note 3x4', 'Xấp', 18, TRUE),
    ('PHONG', 'VPP019', 'Giấy ghi chú', 'Note nhựa trình ký', 'Xấp', 19, TRUE),
    ('PHONG', 'VPP020', 'Băng keo & hồ dán', 'Băng keo 2 mặt 2f4', 'Cuộn', 20, TRUE),
    ('PHONG', 'VPP021', 'Băng keo & hồ dán', 'Băng keo 2 mặt 4f8', 'Cuộn', 21, TRUE),
    ('PHONG', 'VPP022', 'Băng keo & hồ dán', 'Băng keo trong 2f4', 'Cuộn', 22, TRUE),
    ('PHONG', 'VPP023', 'Băng keo & hồ dán', 'Băng keo trong 4f8', 'Cuộn', 23, TRUE),
    ('PHONG', 'VPP024', 'Băng keo & hồ dán', 'Băng keo văn phòng', 'Cuộn', 24, TRUE),
    ('PHONG', 'VPP025', 'Băng keo & hồ dán', 'Băng keo simili 3F6', 'Cuộn', 25, TRUE),
    ('PHONG', 'VPP026', 'Băng keo & hồ dán', 'Băng keo simili 4F8', 'Cuộn', 26, TRUE),
    ('PHONG', 'VPP027', 'Băng keo & hồ dán', 'Băng keo giấy 2f4', 'Cuộn', 27, TRUE),
    ('PHONG', 'VPP028', 'Băng keo & hồ dán', 'Băng keo giấy 4f8', 'Cuộn', 28, TRUE),
    ('PHONG', 'VPP029', 'Bấm, kẹp & ghim', 'Kim bấm số 10', 'Hộp', 29, TRUE),
    ('PHONG', 'VPP030', 'Bấm, kẹp & ghim', 'Cây bấm số 10', 'Cây', 30, TRUE),
    ('PHONG', 'VPP031', 'Bìa & lưu trữ hồ sơ', 'Sơ mi nút', 'Cái', 31, TRUE),
    ('PHONG', 'VPP032', 'Bìa & lưu trữ hồ sơ', 'Sơ mi nút Thiên Long', 'Cái', 32, TRUE),
    ('PHONG', 'VPP033', 'Bìa & lưu trữ hồ sơ', 'Bìa nhựa cột dây', 'Cái', 33, TRUE),
    ('PHONG', 'VPP034', 'Bìa & lưu trữ hồ sơ', 'Bìa lá A4', 'Cái', 34, TRUE),
    ('PHONG', 'VPP035', 'Bìa & lưu trữ hồ sơ', 'Sơ mi 3 dây 7F', 'Cái', 35, TRUE),
    ('PHONG', 'VPP036', 'Bìa & lưu trữ hồ sơ', 'Sơ mi 3 dây 10F', 'Cái', 36, TRUE),
    ('PHONG', 'VPP037', 'Bìa & lưu trữ hồ sơ', 'Sơ mi 3 dây 15F', 'Cái', 37, TRUE),
    ('PHONG', 'VPP038', 'Bìa & lưu trữ hồ sơ', 'Sơ mi 3 dây 20F', 'Cái', 38, TRUE),
    ('PHONG', 'VPP039', 'Dụng cụ văn phòng', 'Dao rọc giấy nhỏ', 'Cây', 39, TRUE),
    ('PHONG', 'VPP040', 'Dụng cụ văn phòng', 'Dao rọc giấy lớn', 'Cây', 40, TRUE),
    ('PHONG', 'VPP041', 'Dụng cụ văn phòng', 'Lưỡi dao rọc giấy nhỏ', 'Hộp', 41, TRUE),
    ('PHONG', 'VPP042', 'Dụng cụ văn phòng', 'Lưỡi dao rọc giấy lớn', 'Hộp', 42, TRUE),
    ('PHONG', 'VPP043', 'Pin', 'Pin AA maxell', 'Hộp', 43, TRUE),
    ('PHONG', 'VPP044', 'Pin', 'Pin AAA maxell', 'Hộp', 44, TRUE),
    ('PHONG', 'VPP045', 'Pin', 'Pin AA Panasonic', 'Hộp', 45, TRUE),
    ('PHONG', 'VPP046', 'Pin', 'Pin AAA Panasonic', 'Hộp', 46, TRUE),
    ('PHONG', 'VPP047', 'Bút viết & bút xóa', 'Viết xóa kéo', 'Cây', 47, TRUE),
    ('PHONG', 'VPP048', 'Bút viết & bút xóa', 'Viết xóa nước', 'Cây', 48, TRUE),
    ('PHONG', 'VPP049', 'Bút viết & bút xóa', 'Viết dạ quang', 'Cây', 49, TRUE),
    ('PHONG', 'VPP050', 'Bút viết & bút xóa', 'Viết lông dầu', 'Cây', 50, TRUE),
    ('PHONG', 'VPP051', 'Bấm, kẹp & ghim', 'Kim kẹp', 'Hộp', 51, TRUE),
    ('PHONG', 'VPP052', 'Dụng cụ văn phòng', 'Mực dấu (Xanh + đỏ + đen)', 'Chai', 52, TRUE),
    ('PHONG', 'VPP053', 'Băng keo & hồ dán', 'Hồ khô', 'Chai', 53, TRUE),
    ('PHONG', 'VPP054', 'Băng keo & hồ dán', 'Hồ nước', 'Chai', 54, TRUE),
    ('PHONG', 'VPP055', 'Dụng cụ văn phòng', 'Dây thun', 'Bịch', 55, TRUE),
    ('PHONG', 'VPP056', 'Dụng cụ văn phòng', 'Dây rút', 'Bịch', 56, TRUE),
    ('PHONG', 'VPP057', 'Bìa & lưu trữ hồ sơ', 'Sơ mi bọc', 'Xấp', 57, TRUE),
    ('PHONG', 'VPP058', 'Bấm, kẹp & ghim', 'Kẹp bướm 15mm', 'Hộp', 58, TRUE),
    ('PHONG', 'VPP059', 'Bấm, kẹp & ghim', 'Kẹp bướm 19mm', 'Hộp', 59, TRUE),
    ('PHONG', 'VPP060', 'Bấm, kẹp & ghim', 'Kẹp bướm 25mm', 'Hộp', 60, TRUE),
    ('PHONG', 'VPP061', 'Bấm, kẹp & ghim', 'Kẹp bướm 32mm', 'Hộp', 61, TRUE),
    ('PHONG', 'VPP062', 'Bấm, kẹp & ghim', 'Kẹp bướm 41mm', 'Hộp', 62, TRUE),
    ('PHONG', 'VPP063', 'Bấm, kẹp & ghim', 'Kẹp bướm 51mm', 'Hộp', 63, TRUE),
    ('PHONG', 'VPP064', 'Bìa & lưu trữ hồ sơ', 'Thùng đựng chứng từ', 'Cái', 64, TRUE),
    ('PHONG', 'VPP065', 'Dụng cụ văn phòng', 'Kéo', 'Cây', 65, TRUE),
    ('PHONG', 'VPP066', 'Bấm, kẹp & ghim', 'Kềm gỡ ghim', 'Cây', 66, TRUE),
    ('PHONG', 'VPP067', 'Dụng cụ văn phòng', 'Máy tính', 'Cái', 67, TRUE),
    ('PHONG', 'VPP068', 'Bìa & lưu trữ hồ sơ', 'Dây buộc hồ sơ', 'Cuộn', 68, TRUE),
    ('PHONG', 'VPP069', 'Bìa & lưu trữ hồ sơ', 'Bìa còng 7F', 'Cái', 69, TRUE),
    ('PHONG', 'VPP070', 'Bìa & lưu trữ hồ sơ', 'Bìa còng 9F', 'Cái', 70, TRUE),
    ('PHONG', 'VPP071', 'Bìa & lưu trữ hồ sơ', 'Khây đựng hồ sơ', 'Cái', 71, TRUE),
    ('PHONG', 'VPP072', 'Dụng cụ văn phòng', 'Khây cắm bút', 'Cái', 72, TRUE),
    ('PHONG', 'VPP073', 'Bấm, kẹp & ghim', 'Cây bấm lỗ', 'Cây', 73, TRUE),
    ('PHONG', 'VPP074', 'Bấm, kẹp & ghim', 'Kim bấm số 3', 'Hộp', 74, TRUE),
    ('PHONG', 'VPP075', 'Sổ & tập', 'Sổ A4', 'Quyển', 75, TRUE),
    ('PHONG', 'VPP076', 'Sổ & tập', 'Sổ công văn', 'Quyển', 76, TRUE),
    ('PHONG', 'VPP077', 'Sổ & tập', 'Tập 96 trang', 'Quyển', 77, TRUE);
