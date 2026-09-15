-- Danh ba email sinh vien (tra cuu cong khai bang MSSV) - xem module studentdirectory.

CREATE TABLE student_emails (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    class_name TEXT,
    major TEXT,
    major_code TEXT,
    cohort TEXT,
    email TEXT NOT NULL,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
