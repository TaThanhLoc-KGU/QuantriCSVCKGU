package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Category;
import com.ttloc.qtcsvc.content.CategoryKind;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends ListCrudRepository<Category, Long> {

    List<Category> findByKindOrderBySortOrder(CategoryKind kind);

    Optional<Category> findByKindAndSlug(CategoryKind kind, String slug);

    boolean existsByKindAndSlug(CategoryKind kind, String slug);

    boolean existsByParentId(Long parentId);

}
