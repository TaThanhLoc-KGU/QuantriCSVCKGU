package com.ttloc.qtcsvc.content.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ttloc.qtcsvc.content.Category;
import com.ttloc.qtcsvc.content.CategoryKind;
import com.ttloc.qtcsvc.content.PageBlock;
import com.ttloc.qtcsvc.content.Post;
import com.ttloc.qtcsvc.content.PostStatus;
import com.ttloc.qtcsvc.identity.Member;
import com.ttloc.qtcsvc.identity.MemberQueryService;
import com.ttloc.qtcsvc.shared.Json;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.RowView;
import static com.ttloc.qtcsvc.content.internal.PageRenderDtos.PageDetail;
import static com.ttloc.qtcsvc.content.internal.PageRenderDtos.ResolvedBlock;

/**
 * Doc "trang con" (danh muc kind=PAGE) cong khai theo duong dan long nhau vd
 * "dao-tao/chuong-trinh-boi-duong" - tuong ung URL /trang/dao-tao/chuong-trinh-boi-duong
 * o frontend, phan anh dung cay danh muc (moi cap 1 slug rieng, khong can slug
 * toan cuc duy nhat).
 */
@Service
class PageRenderService {

    private final CategoryRepository categoryRepository;
    private final PageBlockRepository blockRepository;
    private final PageTableRowRepository rowRepository;
    private final PostRepository postRepository;
    private final MemberQueryService memberQueryService;
    private final ObjectMapper objectMapper;
    private final PageTableRowItemRepository itemRepository;

    PageRenderService(CategoryRepository categoryRepository, PageBlockRepository blockRepository,
                       PageTableRowRepository rowRepository, PostRepository postRepository,
                       MemberQueryService memberQueryService, ObjectMapper objectMapper, PageTableRowItemRepository itemRepository) {
        this.itemRepository = itemRepository;
        this.categoryRepository = categoryRepository;
        this.blockRepository = blockRepository;
        this.rowRepository = rowRepository;
        this.postRepository = postRepository;
        this.memberQueryService = memberQueryService;
        this.objectMapper = objectMapper;
    }

    PageDetail resolve(String path) {
        List<String> segments = new ArrayList<>();
        for (String segment : path.split("/")) {
            if (!segment.isBlank()) segments.add(segment);
        }
        if (segments.isEmpty()) {
            throw new NotFoundException("Khong tim thay trang");
        }

        List<Category> pages = categoryRepository.findByKindOrderBySortOrder(CategoryKind.PAGE);
        Map<Long, List<Category>> childrenByParent = new LinkedHashMap<>();
        for (Category c : pages) {
            childrenByParent.computeIfAbsent(c.parentId(), k -> new ArrayList<>()).add(c);
        }

        Category current = null;
        Long parentId = null;
        List<Category> breadcrumb = new ArrayList<>();
        for (String segment : segments) {
            Category match = childrenByParent.getOrDefault(parentId, List.of()).stream()
                    .filter(c -> c.slug().equals(segment))
                    .findFirst()
                    .orElseThrow(() -> new NotFoundException("Khong tim thay trang: " + path));
            current = match;
            breadcrumb.add(match);
            parentId = match.id();
        }

        List<Category> children = childrenByParent.getOrDefault(current.id(), List.of()).stream()
                .sorted((a, b) -> Integer.compare(a.sortOrder(), b.sortOrder()))
                .toList();

        List<ResolvedBlock> blocks = blockRepository.findByCategoryIdOrderBySortOrder(current.id()).stream()
                .map(this::resolveBlock)
                .toList();

        return new PageDetail(current, breadcrumb, children, blocks);
    }

    private ResolvedBlock resolveBlock(PageBlock block) {
        Map<String, Object> config = readJson(block.config());
        List<RowView> rows = List.of();
        List<Post> posts = List.of();
        List<Member> staff = List.of();

        switch (block.type()) {
            case DATA_TABLE -> {
                var tableRows = rowRepository.findByBlockIdOrderBySortOrder(block.id());
                Map<Long, List<Map<String, Object>>> itemsByRow = new LinkedHashMap<>();
                if (!tableRows.isEmpty()) {
                    itemRepository.findByRowIdInOrderBySortOrder(tableRows.stream().map(r -> r.id()).toList())
                            .forEach(it -> itemsByRow.computeIfAbsent(it.rowId(), k -> new ArrayList<>()).add(readJson(it.data())));
                }
                rows = tableRows.stream()
                        .map(r -> {
                            List<Map<String, Object>> items = itemsByRow.getOrDefault(r.id(), List.of());
                            return new RowView(r.id(), r.groupKey(), r.sortOrder(), readJson(r.data()), items.size(), items);
                        })
                        .toList();
            }
            case POST_LIST -> {
                Object categoryIdRaw = config.get("categoryId");
                if (categoryIdRaw instanceof Number categoryIdNumber) {
                    Object limitRaw = config.get("limit");
                    int limit = limitRaw instanceof Number n ? n.intValue() : 6;
                    posts = postRepository.findByStatusAndCategoryIdIn(PostStatus.PUBLISHED,
                                    Set.of(categoryIdNumber.longValue()),
                                    PageRequest.of(0, Math.max(1, limit), Sort.by(Sort.Direction.DESC, "publishedAt")))
                            .getContent();
                }
            }
            case STAFF_LIST -> staff = memberQueryService.listActive();
            case RICH_TEXT -> {
                // Khong can du lieu them - FE doc thang config.html
            }
        }

        return new ResolvedBlock(block.id(), block.type(), block.title(), config, rows, posts, staff);
    }

    private Map<String, Object> readJson(Json json) {
        if (json == null || json.value() == null || json.value().isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json.value(), new TypeReference<LinkedHashMap<String, Object>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Du lieu bi loi dinh dang JSON", e);
        }
    }

}
