-- Module tasks: Task (aggregate root) + TaskStep (thuoc so huu cua Task, Spring Data JDBC)

CREATE TABLE tasks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    scope TEXT NOT NULL CHECK (scope IN ('DEPT', 'PERSONAL')),
    year INT NOT NULL,
    quarter INT CHECK (quarter BETWEEN 1 AND 4),
    month INT CHECK (month BETWEEN 1 AND 12),
    title TEXT NOT NULL,
    description TEXT,
    assignee_id BIGINT REFERENCES members(id),
    owner_user_id BIGINT REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'CHUA_BAT_DAU'
        CHECK (status IN ('CHUA_BAT_DAU', 'DANG_LAM', 'HOAN_THANH', 'VUONG_MAC', 'TAM_DUNG', 'HUY')),
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_period ON tasks(year, quarter, month);
CREATE INDEX idx_tasks_owner ON tasks(owner_user_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);

CREATE TABLE task_steps (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CHUA_BAT_DAU'
        CHECK (status IN ('CHUA_BAT_DAU', 'DANG_LAM', 'HOAN_THANH', 'VUONG_MAC')),
    note TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_task_steps_task ON task_steps(task_id);
