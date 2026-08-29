package com.ttloc.qtcsvc.content.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ttloc.qtcsvc.content.Category;
import com.ttloc.qtcsvc.content.CategoryKind;
import com.ttloc.qtcsvc.content.PageBlock;
import com.ttloc.qtcsvc.content.PageBlockType;
import com.ttloc.qtcsvc.content.PageTableRow;
import com.ttloc.qtcsvc.shared.Json;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.BlockRequest;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.BlockView;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.Direction;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.RowRequest;
import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.RowView;

/**
 * Quan tri cac khoi noi dung (page_blocks) va dong du lieu bang (page_table_rows)
 * cua 1 danh muc kind=PAGE ("trang con"). Xem PageBlock/PageBlockType.
 */
@Service
class PageBlockService {

    private final PageBlockRepository blockRepository;
    private final PageTableRowRepository rowRepository;
    private final CategoryService categoryService;
    private final ObjectMapper objectMapper;

    PageBlockService(PageBlockRepository blockRepository, PageTableRowRepository rowRepository,
                      CategoryService categoryService, ObjectMapper objectMapper) {
        this.blockRepository = blockRepository;
        this.rowRepository = rowRepository;
        this.categoryService = categoryService;
        this.objectMapper = objectMapper;
    }

    List<BlockView> list(Long categoryId) {
        requirePageCategory(categoryId);
        return blockRepository.findByCategoryIdOrderBySortOrder(categoryId).stream().map(this::toView).toList();
    }

    BlockView create(Long categoryId, BlockRequest request) {
        Category category = requirePageCategory(categoryId);
        if (request.type() == null) {
            throw new IllegalArgumentException("Phai chon loai khoi noi dung");
        }
        int nextOrder = blockRepository.findByCategoryIdOrderBySortOrder(categoryId).stream()
                .mapToInt(PageBlock::sortOrder).max().orElse(-1) + 1;
        Instant now = Instant.now();
        PageBlock block = new PageBlock(null, category.id(), request.type(), blankToNull(request.title()),
                nextOrder, writeJson(request.config()), now, now);
        return toView(blockRepository.save(block));
    }

    BlockView update(Long blockId, BlockRequest request) {
        PageBlock existing = getBlock(blockId);
        PageBlock updated = new PageBlock(existing.id(), existing.categoryId(), existing.type(),
                blankToNull(request.title()), existing.sortOrder(), writeJson(request.config()),
                existing.createdAt(), Instant.now());
        return toView(blockRepository.save(updated));
    }

    void delete(Long blockId) {
        getBlock(blockId);
        blockRepository.deleteById(blockId);
    }

    BlockView move(Long blockId, Direction direction) {
        PageBlock block = getBlock(blockId);
        List<PageBlock> siblings = blockRepository.findByCategoryIdOrderBySortOrder(block.categoryId());
        int index = indexOfId(siblings.stream().map(PageBlock::id).toList(), blockId);
        int swapWith = direction == Direction.UP ? index - 1 : index + 1;
        if (index >= 0 && swapWith >= 0 && swapWith < siblings.size()) {
            PageBlock a = siblings.get(index);
            PageBlock b = siblings.get(swapWith);
            blockRepository.save(withSortOrder(a, b.sortOrder()));
            blockRepository.save(withSortOrder(b, a.sortOrder()));
        }
        return toView(getBlock(blockId));
    }

    RowView createRow(Long blockId, RowRequest request) {
        PageBlock block = requireDataTableBlock(blockId);
        int nextOrder = rowRepository.findByBlockIdOrderBySortOrder(blockId).stream()
                .mapToInt(PageTableRow::sortOrder).max().orElse(-1) + 1;
        PageTableRow row = new PageTableRow(null, block.id(), blankToNull(request.groupKey()), nextOrder, writeJson(request.data()));
        return toRowView(rowRepository.save(row));
    }

    RowView updateRow(Long rowId, RowRequest request) {
        PageTableRow existing = getRow(rowId);
        PageTableRow updated = new PageTableRow(existing.id(), existing.blockId(), blankToNull(request.groupKey()),
                existing.sortOrder(), writeJson(request.data()));
        return toRowView(rowRepository.save(updated));
    }

    void deleteRow(Long rowId) {
        getRow(rowId);
        rowRepository.deleteById(rowId);
    }

    RowView moveRow(Long rowId, Direction direction) {
        PageTableRow row = getRow(rowId);
        List<PageTableRow> siblings = rowRepository.findByBlockIdOrderBySortOrder(row.blockId());
        int index = indexOfId(siblings.stream().map(PageTableRow::id).toList(), rowId);
        int swapWith = direction == Direction.UP ? index - 1 : index + 1;
        if (index >= 0 && swapWith >= 0 && swapWith < siblings.size()) {
            PageTableRow a = siblings.get(index);
            PageTableRow b = siblings.get(swapWith);
            rowRepository.save(withSortOrder(a, b.sortOrder()));
            rowRepository.save(withSortOrder(b, a.sortOrder()));
        }
        return toRowView(getRow(rowId));
    }

    private PageBlock requireDataTableBlock(Long blockId) {
        PageBlock block = getBlock(blockId);
        if (block.type() != PageBlockType.DATA_TABLE) {
            throw new IllegalArgumentException("Chi khoi DATA_TABLE moi co dong du lieu");
        }
        return block;
    }

    private Category requirePageCategory(Long categoryId) {
        Category category = categoryService.get(categoryId);
        if (category.kind() != CategoryKind.PAGE) {
            throw new IllegalArgumentException("Danh muc nay khong phai trang con (kind=PAGE)");
        }
        return category;
    }

    private PageBlock getBlock(Long blockId) {
        return blockRepository.findById(blockId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay khoi noi dung: " + blockId));
    }

    private PageTableRow getRow(Long rowId) {
        return rowRepository.findById(rowId)
                .orElseThrow(() -> new NotFoundException("Khong tim thay dong du lieu: " + rowId));
    }

    private static int indexOfId(List<Long> ids, Long id) {
        for (int i = 0; i < ids.size(); i++) {
            if (ids.get(i).equals(id)) return i;
        }
        return -1;
    }

    private static PageBlock withSortOrder(PageBlock block, int sortOrder) {
        return new PageBlock(block.id(), block.categoryId(), block.type(), block.title(), sortOrder,
                block.config(), block.createdAt(), block.updatedAt());
    }

    private static PageTableRow withSortOrder(PageTableRow row, int sortOrder) {
        return new PageTableRow(row.id(), row.blockId(), row.groupKey(), sortOrder, row.data());
    }

    private BlockView toView(PageBlock block) {
        List<RowView> rows = block.type() == PageBlockType.DATA_TABLE
                ? rowRepository.findByBlockIdOrderBySortOrder(block.id()).stream().map(this::toRowView).toList()
                : List.of();
        return new BlockView(block.id(), block.categoryId(), block.type(), block.title(), block.sortOrder(),
                readJson(block.config()), rows);
    }

    private RowView toRowView(PageTableRow row) {
        return new RowView(row.id(), row.groupKey(), row.sortOrder(), readJson(row.data()));
    }

    private Json writeJson(Map<String, Object> data) {
        try {
            return new Json(objectMapper.writeValueAsString(data == null ? Map.of() : data));
        } catch (Exception e) {
            throw new IllegalStateException("Khong the ghi du lieu thanh JSON", e);
        }
    }

    private Map<String, Object> readJson(Json json) {
        if (json == null || json.value() == null || json.value().isBlank()) {
            return new LinkedHashMap<>();
        }
        try {
            return objectMapper.readValue(json.value(), new TypeReference<LinkedHashMap<String, Object>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Du lieu bi loi dinh dang JSON", e);
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s;
    }

}
