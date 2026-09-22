-- Module settings: cau hinh he thong dang key-value

CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
