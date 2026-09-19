-- Danh sach chi tiet cua tung dong bang du lieu (vd hoc phan cua tung nganh dao tao).
CREATE TABLE page_table_row_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    row_id BIGINT NOT NULL REFERENCES page_table_rows(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_page_row_items_row ON page_table_row_items(row_id, sort_order);
