-- Mo rong document_numbers de ho tro nop van ban den qua form cong khai:
-- nguoi gui lien he (email/dien thoai), URL file dinh kem (luu truc tiep qua
-- shared.FileStorageService/MinIO, khong qua bang media_files cua module
-- content de tranh phu thuoc cheo module), va lien ket toi Nhiem vu (Task)
-- duoc tu dong tao de theo doi xu ly. task_id la tham chieu mem sang module
-- tasks (khong dat FK cung theo quy uoc doc lap module).
ALTER TABLE document_numbers
    ADD COLUMN sender_email TEXT,
    ADD COLUMN sender_phone TEXT,
    ADD COLUMN attachment_url TEXT,
    ADD COLUMN attachment_name TEXT,
    ADD COLUMN task_id BIGINT;

CREATE INDEX idx_document_numbers_task ON document_numbers(task_id);
