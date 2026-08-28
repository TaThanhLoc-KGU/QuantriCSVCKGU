-- Module content: danh muc, bai viet, banner, media, bieu mau, thong bao

CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('POST', 'FORM')),
    parent_id BIGINT REFERENCES categories(id),
    sort_order INT NOT NULL DEFAULT 0,
    description TEXT
);

CREATE UNIQUE INDEX idx_categories_kind_slug ON categories(kind, slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

CREATE TABLE media_files (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    url TEXT NOT NULL,
    mime_type TEXT,
    size BIGINT,
    folder TEXT,
    uploaded_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT,
    content TEXT,
    thumbnail_url TEXT,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    author_id BIGINT NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    view_count INT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_status_published_at ON posts(status, published_at DESC);

CREATE TABLE banners (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE,
    end_date DATE
);

CREATE TABLE forms (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    file_id BIGINT NOT NULL REFERENCES media_files(id),
    version TEXT,
    download_count INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_forms_category ON forms(category_id);

CREATE TABLE notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT NOT NULL DEFAULT 'GENERAL' CHECK (type IN ('GENERAL', 'PROCUREMENT')),
    level TEXT NOT NULL DEFAULT 'NORMAL' CHECK (level IN ('NORMAL', 'URGENT')),
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_type ON notifications(type);
