-- Module identity: Member (nhan su) + User (tai khoan dang nhap)

CREATE TABLE members (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    position TEXT,
    email TEXT,
    phone TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'LOCAL'
        CHECK (auth_provider IN ('LOCAL', 'GOOGLE', 'BOTH')),
    google_sub TEXT,
    role TEXT NOT NULL DEFAULT 'STAFF'
        CHECK (role IN ('STAFF', 'EDITOR', 'ADMIN')),
    member_id BIGINT REFERENCES members(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role);
CREATE UNIQUE INDEX idx_users_google_sub ON users(google_sub) WHERE google_sub IS NOT NULL;
