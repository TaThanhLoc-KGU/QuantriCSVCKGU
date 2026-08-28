-- Module documentregister: loai van ban + so van ban (di/den)

CREATE TABLE document_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    symbol_code TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('OUTGOING', 'INCOMING')),
    reset_yearly BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Khong dat UNIQUE (document_type_id, year, number_int): du lieu lich su co the trung so,
-- ung dung chi CANH BAO chu khong khoa cung (xem spec 6.3).
CREATE TABLE document_numbers (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    document_type_id BIGINT NOT NULL REFERENCES document_types(id),
    year INT NOT NULL,
    number_int INT NOT NULL,
    number_display TEXT NOT NULL,
    title TEXT NOT NULL,
    person TEXT,
    issue_date DATE NOT NULL,
    note TEXT,
    -- Cac truong sau chi dung cho INCOMING, NULL voi OUTGOING
    sender_unit TEXT,
    original_ref TEXT,
    received_date DATE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_document_numbers_type_year ON document_numbers(document_type_id, year);
