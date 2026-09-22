-- Trang con (micro-site): danh muc kind=PAGE + cac khoi noi dung tuy chinh
-- (rich text, danh sach tin, bang du lieu tra cuu, danh sach nhan su).

ALTER TABLE categories DROP CONSTRAINT categories_kind_check;
ALTER TABLE categories ADD CONSTRAINT categories_kind_check CHECK (kind IN ('POST', 'FORM', 'PAGE'));

CREATE TABLE page_blocks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('RICH_TEXT', 'POST_LIST', 'DATA_TABLE', 'STAFF_LIST')),
    title TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_blocks_category ON page_blocks(category_id);

-- Cac dong du lieu cua khoi DATA_TABLE. group_key khop voi "key" cua 1 phan tu
-- trong config.groups (null neu khoi khong bat loc theo nhom). data la JSON
-- {columnKey: value} - gia tri phu thuoc kieu cot (TEXT/DATE la chuoi,
-- LINK la {url,label}, FILE la {mediaId,url,name}).
CREATE TABLE page_table_rows (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    block_id BIGINT NOT NULL REFERENCES page_blocks(id) ON DELETE CASCADE,
    group_key TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_page_table_rows_block ON page_table_rows(block_id);
