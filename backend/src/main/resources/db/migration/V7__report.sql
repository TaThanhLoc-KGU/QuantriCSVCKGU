-- Module report: bao cao thang/quy, noi dung tung muc luu dang JSONB

CREATE TABLE reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period_type TEXT NOT NULL CHECK (period_type IN ('MONTH', 'QUARTER')),
    period_id TEXT NOT NULL UNIQUE,
    year INT NOT NULL,
    sections JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_provider TEXT,
    ai_generated_at TIMESTAMPTZ,
    updated_by BIGINT REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
