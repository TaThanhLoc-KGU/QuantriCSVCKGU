-- Them email nguoi gui vao yeu cau khoi phuc tai khoan, de admin gui ket
-- qua xu ly qua email (spec: admin tu soan noi dung, xem
-- accountrecovery.internal.AccountRecoveryAdminController.sendResult).
ALTER TABLE account_recovery_requests ADD COLUMN email TEXT;
