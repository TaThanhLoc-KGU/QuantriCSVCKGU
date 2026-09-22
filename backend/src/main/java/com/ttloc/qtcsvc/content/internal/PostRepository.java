package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Post;
import com.ttloc.qtcsvc.content.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends ListCrudRepository<Post, Long>, PagingAndSortingRepository<Post, Long> {

    Page<Post> findByStatusAndCategoryIdIn(PostStatus status, Collection<Long> categoryIds, Pageable pageable);

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    Page<Post> findByStatusAndFeaturedTrue(PostStatus status, Pageable pageable);

    Optional<Post> findBySlugAndStatus(String slug, PostStatus status);

    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Modifying
    @Query("UPDATE posts SET view_count = view_count + 1 WHERE id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Query("""
            SELECT * FROM posts
            WHERE status = 'PUBLISHED'
              AND search_vector @@ websearch_to_tsquery('simple', immutable_unaccent(:query))
            ORDER BY ts_rank(search_vector, websearch_to_tsquery('simple', immutable_unaccent(:query))) DESC
            LIMIT :limit
            """)
    List<Post> search(@Param("query") String query, @Param("limit") int limit);

}
