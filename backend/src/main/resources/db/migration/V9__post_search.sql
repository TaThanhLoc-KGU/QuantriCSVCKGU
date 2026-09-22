-- Full-text search tieng Viet khong dau cho Post (spec 4.6).
-- Postgres khong co config "vietnamese" san, nen dung config 'simple' + unaccent
-- de bo dau truoc khi tokenize.

CREATE EXTENSION IF NOT EXISTS unaccent;

-- unaccent() mac dinh la STABLE, khong dung truc tiep trong generated column /
-- index expression duoc (yeu cau IMMUTABLE) -> boc lai 1 ham IMMUTABLE.
CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text AS $$
    SELECT unaccent('unaccent', $1)
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;

ALTER TABLE posts ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('simple', immutable_unaccent(coalesce(title, ''))), 'A') ||
        setweight(to_tsvector('simple', immutable_unaccent(coalesce(summary, ''))), 'B') ||
        setweight(to_tsvector('simple', immutable_unaccent(coalesce(content, ''))), 'C')
    ) STORED;

CREATE INDEX idx_posts_search_vector ON posts USING GIN (search_vector);
