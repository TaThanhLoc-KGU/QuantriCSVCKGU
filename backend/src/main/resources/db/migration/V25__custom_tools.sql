-- Bo cong cu tu tao chuc nang: don vi tu dinh nghia bieu mau thu thap thong tin
-- hoac bang tra cuu, khong can lap trinh (module customtool).

CREATE TABLE custom_tools (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    kind TEXT NOT NULL CHECK (kind IN ('FORM', 'LOOKUP')),
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE custom_tool_submissions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tool_id BIGINT NOT NULL REFERENCES custom_tools(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'MOI' CHECK (status IN ('MOI', 'DA_XU_LY', 'TU_CHOI')),
    result_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX idx_tool_submissions_tool ON custom_tool_submissions(tool_id, created_at DESC);

CREATE TABLE custom_tool_rows (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tool_id BIGINT NOT NULL REFERENCES custom_tools(id) ON DELETE CASCADE,
    key_value TEXT NOT NULL,
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_tool_rows_key ON custom_tool_rows(tool_id, lower(key_value));
