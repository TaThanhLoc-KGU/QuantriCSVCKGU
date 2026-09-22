package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Post;
import com.ttloc.qtcsvc.content.PostStatus;
import com.ttloc.qtcsvc.identity.CurrentUser;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.shared.Slugs;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Stream;

@Service
class PostService {

    private final PostRepository repository;
    private final CategoryService categoryService;

    PostService(PostRepository repository, CategoryService categoryService) {
        this.repository = repository;
        this.categoryService = categoryService;
    }

    // ---- Admin ----

    List<Post> adminList(CurrentUser currentUser, Long categoryId, PostStatus status, Long authorId, String q) {
        Stream<Post> stream = repository.findAll().stream();
        if (!currentUser.isEditorOrAdmin()) {
            stream = stream.filter(p -> currentUser.id().equals(p.authorId()));
        } else if (authorId != null) {
            stream = stream.filter(p -> authorId.equals(p.authorId()));
        }
        if (categoryId != null) {
            stream = stream.filter(p -> categoryId.equals(p.categoryId()));
        }
        if (status != null) {
            stream = stream.filter(p -> status == p.status());
        }
        if (q != null && !q.isBlank()) {
            String needle = q.toLowerCase();
            stream = stream.filter(p -> p.title() != null && p.title().toLowerCase().contains(needle));
        }
        return stream.sorted(Comparator.comparing(Post::createdAt).reversed()).toList();
    }

    Post get(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay bai viet: " + id));
    }

    Post create(CurrentUser currentUser, PostRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Tieu de khong duoc de trong");
        }
        if (request.categoryId() == null) {
            throw new IllegalArgumentException("Phai chon danh muc");
        }
        categoryService.get(request.categoryId());

        String slug = uniqueSlug(Slugs.slugify(request.title()), null);
        PostStatus status = Boolean.TRUE.equals(request.publish()) ? PostStatus.PUBLISHED : PostStatus.DRAFT;
        Instant now = Instant.now();
        Post post = new Post(null, request.title(), slug, request.summary(), request.content(), request.thumbnailUrl(),
                request.categoryId(), currentUser.id(), status,
                Boolean.TRUE.equals(request.featured()), Boolean.TRUE.equals(request.pinned()), 0,
                status == PostStatus.PUBLISHED ? now : null, now, now);
        return repository.save(post);
    }

    Post update(CurrentUser currentUser, Long id, PostRequest request) {
        Post existing = get(id);
        assertCanEdit(currentUser, existing);
        if (request.categoryId() != null) {
            categoryService.get(request.categoryId());
        }

        String slug = existing.slug();
        if (request.title() != null && !request.title().isBlank() && !request.title().equals(existing.title())) {
            slug = uniqueSlug(Slugs.slugify(request.title()), id);
        }

        PostStatus status = existing.status();
        Instant publishedAt = existing.publishedAt();
        if (request.publish() != null) {
            if (request.publish() && status != PostStatus.PUBLISHED) {
                status = PostStatus.PUBLISHED;
                publishedAt = Instant.now();
            } else if (!request.publish()) {
                status = PostStatus.DRAFT;
            }
        }

        Post updated = new Post(
                existing.id(),
                request.title() != null ? request.title() : existing.title(),
                slug,
                request.summary() != null ? request.summary() : existing.summary(),
                request.content() != null ? request.content() : existing.content(),
                request.thumbnailUrl() != null ? request.thumbnailUrl() : existing.thumbnailUrl(),
                request.categoryId() != null ? request.categoryId() : existing.categoryId(),
                existing.authorId(),
                status,
                request.featured() != null ? request.featured() : existing.featured(),
                request.pinned() != null ? request.pinned() : existing.pinned(),
                existing.viewCount(),
                publishedAt,
                existing.createdAt(),
                Instant.now());
        return repository.save(updated);
    }

    void delete(CurrentUser currentUser, Long id) {
        Post existing = get(id);
        assertCanEdit(currentUser, existing);
        repository.deleteById(id);
    }

    private void assertCanEdit(CurrentUser currentUser, Post post) {
        if (!currentUser.isEditorOrAdmin() && !currentUser.id().equals(post.authorId())) {
            throw new AccessDeniedException("Ban chi duoc sua/xoa bai viet cua chinh minh");
        }
    }

    private String uniqueSlug(String base, Long excludeId) {
        String slug = base.isBlank() ? "bai-viet" : base;
        String candidate = slug;
        int suffix = 2;
        while (true) {
            Optional<Post> existing = repository.findBySlug(candidate);
            if (existing.isEmpty() || existing.get().id().equals(excludeId)) {
                return candidate;
            }
            candidate = slug + "-" + suffix++;
        }
    }

    // ---- Public ----

    Page<Post> publicList(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("publishedAt")));
        if (categoryId != null) {
            Set<Long> ids = categoryService.selfAndDescendantIds(categoryId);
            return repository.findByStatusAndCategoryIdIn(PostStatus.PUBLISHED, ids, pageable);
        }
        return repository.findByStatus(PostStatus.PUBLISHED, pageable);
    }

    List<Post> featured(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "publishedAt"));
        return repository.findByStatusAndFeaturedTrue(PostStatus.PUBLISHED, pageable).getContent();
    }

    Post publicDetail(String slug) {
        return repository.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
                .orElseThrow(() -> new NotFoundException("Khong tim thay bai viet"));
    }

    /**
     * Dung cho trang /cong-khai (spec 4.5): lay tat ca bai PUBLISHED thuoc
     * danh muc co slug tuong ung (+ danh muc con). Neu danh muc chua duoc tao
     * (ADMIN xoa/doi slug) thi tra danh sach rong thay vi loi.
     */
    List<Post> publicByCategorySlug(com.ttloc.qtcsvc.content.CategoryKind kind, String slug) {
        return categoryService.findBySlug(kind, slug)
                .map(c -> {
                    Set<Long> ids = categoryService.selfAndDescendantIds(c.id());
                    Pageable pageable = PageRequest.of(0, 200, Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("publishedAt")));
                    return repository.findByStatusAndCategoryIdIn(PostStatus.PUBLISHED, ids, pageable).getContent();
                })
                .orElse(List.of());
    }

    List<Post> search(String q, int limit) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        return repository.search(q.trim(), limit);
    }

    List<Post> related(Post post, int limit) {
        Pageable pageable = PageRequest.of(0, limit + 1, Sort.by(Sort.Direction.DESC, "publishedAt"));
        return repository.findByStatusAndCategoryIdIn(PostStatus.PUBLISHED, Set.of(post.categoryId()), pageable)
                .getContent().stream()
                .filter(p -> !p.id().equals(post.id()))
                .limit(limit)
                .toList();
    }

    /**
     * Tang view (1 lan/phien) va tra ve Post da cap nhat viewCount. QUAN TRONG:
     * "post" truyen vao la snapshot load TRUOC khi tang trong DB (Post la
     * record bat bien), neu tra thang no ra thi client se thay viewCount cu -
     * phai tu cong 1 vao ban sao khi thuc su tang.
     */
    @SuppressWarnings("unchecked")
    Post registerView(Post post, HttpSession session) {
        Set<Long> viewed = (Set<Long>) session.getAttribute("viewedPosts");
        if (viewed == null) {
            viewed = new HashSet<>();
            session.setAttribute("viewedPosts", viewed);
        }
        if (viewed.add(post.id())) {
            repository.incrementViewCount(post.id());
            return new Post(post.id(), post.title(), post.slug(), post.summary(), post.content(),
                    post.thumbnailUrl(), post.categoryId(), post.authorId(), post.status(), post.featured(),
                    post.pinned(), post.viewCount() + 1, post.publishedAt(), post.createdAt(), post.updatedAt());
        }
        return post;
    }

}
