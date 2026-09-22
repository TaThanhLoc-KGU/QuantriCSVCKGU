-- Tra cuu ket qua xu ly qua web (khong dang nhap): nguoi gui nhap ma ho so +
-- CCCD + SDT + MSSV de xem trang thai, khong can qua email. Them ma ho so
-- (case_code, cong khai, sinh ngau nhien khi nop), so dien thoai, va noi
-- dung ket qua da gui (result_message) de hien thi lai tren web.
ALTER TABLE account_recovery_requests ADD COLUMN case_code TEXT;
ALTER TABLE account_recovery_requests ADD COLUMN phone TEXT;
ALTER TABLE account_recovery_requests ADD COLUMN result_message TEXT;

-- Backfill ma ho so cho cac dong da co san (neu co), tranh trung nhau.
UPDATE account_recovery_requests
SET case_code = 'KP-' || UPPER(SUBSTRING(MD5(id::text || clock_timestamp()::text || random()::text), 1, 8))
WHERE case_code IS NULL;

ALTER TABLE account_recovery_requests ALTER COLUMN case_code SET NOT NULL;
CREATE UNIQUE INDEX idx_account_recovery_case_code ON account_recovery_requests(case_code);
