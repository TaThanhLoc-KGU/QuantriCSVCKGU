package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Category;
import com.ttloc.qtcsvc.content.CategoryKind;
import com.ttloc.qtcsvc.shared.ConflictException;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.shared.Slugs;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    CategoryService(CategoryRepository repository) {
        this.repository = repository;
    }

    public List<Category> tree(CategoryKind kind) {
        return repository.findByKindOrderBySortOrder(kind);
    }

    public Category get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Khong tim thay danh muc: " + id));
    }

    public Optional<Category> findBySlug(CategoryKind kind, String slug) {
        return repository.findByKindAndSlug(kind, slug);
    }

    /**
     * Id cua chinh danh muc nay va tat ca danh muc con (de qui, khong gioi han cap)
     * - dung de loc bai/bieu mau thuoc danh muc + moi danh muc con (spec 4.2).
     */
    public Set<Long> selfAndDescendantIds(Long categoryId) {
        Category root = get(categoryId);
        List<Category> all = repository.findByKindOrderBySortOrder(root.kind());
        Map<Long, List<Long>> childrenByParent = new HashMap<>();
        for (Category c : all) {
            if (c.parentId() != null) {
                childrenByParent.computeIfAbsent(c.parentId(), k -> new ArrayList<>()).add(c.id());
            }
        }
        Set<Long> result = new LinkedHashSet<>();
        Deque<Long> queue = new ArrayDeque<>();
        queue.add(categoryId);
        while (!queue.isEmpty()) {
            Long current = queue.poll();
            if (result.add(current)) {
                queue.addAll(childrenByParent.getOrDefault(current, List.of()));
            }
        }
        return result;
    }

    public Category create(CategoryRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Ten danh muc khong duoc de trong");
        }
        if (request.kind() == null) {
            throw new IllegalArgumentException("Phai chon loai danh muc (POST/FORM)");
        }
        if (request.parentId() != null) {
            Category parent = get(request.parentId());
            if (parent.kind() != request.kind()) {
                throw new IllegalArgumentException("Danh muc cha phai cung loai (POST/FORM)");
            }
        }
        String slug = uniqueSlug(request.kind(), Slugs.slugify(request.name()), null);
        Category category = new Category(null, request.name(), slug, request.kind(), request.parentId(),
                request.sortOrder() == null ? 0 : request.sortOrder(), request.description());
        return repository.save(category);
    }

    public Category update(Long id, CategoryRequest request) {
        Category existing = get(id);
        Long newParentId = request.parentId();
        if (newParentId != null) {
            if (newParentId.equals(id) || selfAndDescendantIds(id).contains(newParentId)) {
                throw new IllegalArgumentException("Khong the chon chinh no/danh muc con lam danh muc cha (tao vong lap)");
            }
        }
        String slug = existing.slug();
        if (request.name() != null && !request.name().isBlank() && !request.name().equals(existing.name())) {
            slug = uniqueSlug(existing.kind(), Slugs.slugify(request.name()), id);
        }
        Category updated = new Category(
                existing.id(),
                request.name() != null ? request.name() : existing.name(),
                slug,
                existing.kind(),
                newParentId,
                request.sortOrder() != null ? request.sortOrder() : existing.sortOrder(),
                request.description() != null ? request.description() : existing.description());
        return repository.save(updated);
    }

    public void delete(Long id) {
        get(id);
        if (repository.existsByParentId(id)) {
            throw new ConflictException("Con danh muc con ben trong, khong the xoa");
        }
        // Neu con Post/Form tham chieu, FK RESTRICT se nem DataIntegrityViolationException -> 409
        repository.deleteById(id);
    }

    private String uniqueSlug(CategoryKind kind, String base, Long excludeId) {
        String slug = base.isBlank() ? "danh-muc" : base;
        String candidate = slug;
        int suffix = 2;
        while (true) {
            Optional<Category> existing = repository.findByKindAndSlug(kind, candidate);
            if (existing.isEmpty() || existing.get().id().equals(excludeId)) {
                return candidate;
            }
            candidate = slug + "-" + suffix++;
        }
    }

}
