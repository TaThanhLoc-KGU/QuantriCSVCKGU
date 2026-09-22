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
import com.ttloc.qtcsvc.content.PageTableRowItem;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;

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
    private final PageTableRowItemRepository itemRepository;

    PageBlockService(PageBlockRepository blockRepository, PageTableRowRepository rowRepository,
                      CategoryService categoryService, ObjectMapper objectMapper, PageTableRowItemRepository itemRepository) {
        this.itemRepository = itemRepository;
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

    // ---- Danh sach chi tiet cua 1 dong (vd hoc phan cua nganh), nhap tu Excel ----

    List<Map<String, Object>> itemsOf(Long rowId) {
        getRow(rowId);
        return itemRepository.findByRowIdOrderBySortOrder(rowId).stream().map(i -> readJson(i.data())).toList();
    }

    /**
     * Doc Excel (dong 1 la tieu de). commit=false: chi tra so dong + tieu de. commit=true: thay toan bo muc chi tiet
     * cua dong; neu khoi chua co cot chi tiet thi tao tu tieu de, neu da co thi map theo thu tu cot.
     */
    @Transactional
    Map<String, Object> importItems(Long rowId, MultipartFile file, boolean commit) {
        PageTableRow row = getRow(rowId);
        DataFormatter fmt = new DataFormatter();
        List<String> headers = new ArrayList<>();
        List<List<String>> data = new ArrayList<>();
        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            Row head = sheet.getRow(0);
            if (head == null) throw new IllegalArgumentException("File trống");
            int cols = head.getLastCellNum();
            for (int c = 0; c < cols; c++) {
                Cell cell = head.getCell(c);
                String h = cell == null ? "" : fmt.formatCellValue(cell).trim();
                headers.add(h.isEmpty() ? "Cột " + (c + 1) : h);
            }
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row rr = sheet.getRow(r);
                if (rr == null) continue;
                List<String> vals = new ArrayList<>();
                boolean any = false;
                for (int c = 0; c < cols; c++) {
                    Cell cell = rr.getCell(c);
                    String v = cell == null ? "" : fmt.formatCellValue(cell).trim();
                    if (!v.isEmpty()) any = true;
                    vals.add(v);
                }
                if (any) data.add(vals);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được file Excel", e);
        }
        if (!commit) return Map.of("rowCount", data.size(), "headers", headers);

        PageBlock block = getBlock(row.blockId());
        Map<String, Object> config = new LinkedHashMap<>(readJson(block.config()));
        Map<String, Object> detail = new LinkedHashMap<>();
        if (config.get("detail") instanceof Map<?, ?> m) m.forEach((k, v) -> detail.put(String.valueOf(k), v));
        List<?> existing = detail.get("columns") instanceof List<?> l ? l : List.of();
        List<Map<String, Object>> cols = new ArrayList<>();
        if (existing.isEmpty()) {
            for (int i = 0; i < headers.size(); i++) cols.add(new LinkedHashMap<>(Map.of("key", "d" + (i + 1), "label", headers.get(i))));
            detail.put("columns", cols);
            config.put("detail", detail);
            blockRepository.save(new PageBlock(block.id(), block.categoryId(), block.type(), block.title(), block.sortOrder(),
                    writeJson(config), block.createdAt(), Instant.now()));
        } else {
            for (Object o : existing) if (o instanceof Map<?, ?> m) cols.add(new LinkedHashMap<>((Map<String, Object>) m));
        }
        itemRepository.deleteAllByRow(rowId);
        List<PageTableRowItem> batch = new ArrayList<>();
        int order = 0;
        for (List<String> vals : data) {
            Map<String, Object> m = new LinkedHashMap<>();
            for (int i = 0; i < cols.size() && i < vals.size(); i++) m.put(String.valueOf(cols.get(i).get("key")), vals.get(i));
            batch.add(new PageTableRowItem(null, rowId, order++, writeJson(m)));
        }
        itemRepository.saveAll(batch);
        return Map.of("importedCount", batch.size());
    }

    /** Chuan hoa ten de so khop: bo dau, thuong hoa, gop khoang trang. */
    private static String norm(String s) {
        if (s == null) return "";
        String n = java.text.Normalizer.normalize(s.trim().toLowerCase(), java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").replace('đ', 'd');
        return n.replaceAll("\\s+", " ");
    }

    private String rowName(PageBlock block, PageTableRow row) {
        Map<String, Object> data = readJson(row.data());
        Object cols = readJson(block.config()).get("columns");
        if (cols instanceof List<?> l && !l.isEmpty() && l.get(0) instanceof Map<?, ?> c && c.get("key") != null) {
            Object v = data.get(String.valueOf(c.get("key")));
            if (v != null) return v.toString();
        }
        return String.valueOf(data.values().stream().filter(v -> v instanceof String).findFirst().orElse(""));
    }

    /**
     * Nhap 1 lan cho ca bang: 1 file Excel chung, 1 cot xac dinh dong (vd "Nganh"), cac cot con lai la chi tiet.
     * Khop dong theo ten (bo dau/hoa thuong); createMissing=true thi tao dong moi cho ten chua co.
     * commit=false: tra ve tieu de, so dong va tung nhom (co khop dong nao khong).
     */
    @Transactional
    Map<String, Object> importItemsBulk(Long blockId, MultipartFile file, int keyIndex, boolean createMissing, boolean commit) {
        PageBlock block = requireDataTableBlock(blockId);
        DataFormatter fmt = new DataFormatter();
        List<String> headers = new ArrayList<>();
        List<List<String>> data = new ArrayList<>();
        try (Workbook wb = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = wb.getSheetAt(0);
            Row head = sheet.getRow(0);
            if (head == null) throw new IllegalArgumentException("File trống");
            int cols = head.getLastCellNum();
            for (int c = 0; c < cols; c++) {
                Cell cell = head.getCell(c);
                String h = cell == null ? "" : fmt.formatCellValue(cell).trim();
                headers.add(h.isEmpty() ? "Cột " + (c + 1) : h);
            }
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row rr = sheet.getRow(r);
                if (rr == null) continue;
                List<String> vals = new ArrayList<>();
                boolean any = false;
                for (int c = 0; c < cols; c++) {
                    Cell cell = rr.getCell(c);
                    String v = cell == null ? "" : fmt.formatCellValue(cell).trim();
                    if (!v.isEmpty()) any = true;
                    vals.add(v);
                }
                if (any) data.add(vals);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được file Excel", e);
        }
        if (keyIndex < 0 || keyIndex >= headers.size()) throw new IllegalArgumentException("Cột xác định ngành không hợp lệ");

        Map<String, List<List<String>>> byName = new LinkedHashMap<>();
        Map<String, String> display = new LinkedHashMap<>();
        for (List<String> vals : data) {
            String name = vals.get(keyIndex);
            if (name.isBlank()) continue;
            String k = norm(name);
            byName.computeIfAbsent(k, x -> new ArrayList<>()).add(vals);
            display.putIfAbsent(k, name);
        }

        List<PageTableRow> existingRows = rowRepository.findByBlockIdOrderBySortOrder(blockId);
        Map<String, PageTableRow> rowByName = new LinkedHashMap<>();
        for (PageTableRow r : existingRows) rowByName.putIfAbsent(norm(rowName(block, r)), r);

        if (!commit) {
            List<Map<String, Object>> groups = new ArrayList<>();
            for (var e : byName.entrySet()) {
                groups.add(Map.of("name", display.get(e.getKey()), "count", e.getValue().size(), "matched", rowByName.containsKey(e.getKey())));
            }
            return Map.of("headers", headers, "rowCount", data.size(), "groups", groups);
        }

        // Cot chi tiet = tat ca cot tru cot khoa; dung lai bo cot cu neu da co.
        List<Integer> detailIdx = new ArrayList<>();
        for (int i = 0; i < headers.size(); i++) if (i != keyIndex) detailIdx.add(i);
        Map<String, Object> config = new LinkedHashMap<>(readJson(block.config()));
        Map<String, Object> detail = new LinkedHashMap<>();
        if (config.get("detail") instanceof Map<?, ?> m) m.forEach((k, v) -> detail.put(String.valueOf(k), v));
        List<Map<String, Object>> cols = new ArrayList<>();
        if (detail.get("columns") instanceof List<?> l) for (Object o : l) if (o instanceof Map<?, ?> m) {
            Map<String, Object> cm = new LinkedHashMap<>();
            m.forEach((k, v) -> cm.put(String.valueOf(k), v));
            cols.add(cm);
        }
        if (cols.isEmpty()) {
            for (int n = 0; n < detailIdx.size(); n++) {
                cols.add(new LinkedHashMap<>(Map.of("key", "d" + (n + 1), "label", headers.get(detailIdx.get(n)))));
            }
            detail.put("columns", cols);
            config.put("detail", detail);
            blockRepository.save(new PageBlock(block.id(), block.categoryId(), block.type(), block.title(), block.sortOrder(),
                    writeJson(config), block.createdAt(), Instant.now()));
        }

        String nameKey = "";
        if (readJson(block.config()).get("columns") instanceof List<?> l && !l.isEmpty() && l.get(0) instanceof Map<?, ?> c0) nameKey = String.valueOf(c0.get("key"));
        int nextOrder = existingRows.stream().mapToInt(PageTableRow::sortOrder).max().orElse(-1) + 1;
        int programs = 0;
        int items = 0;
        int created = 0;
        for (var e : byName.entrySet()) {
            PageTableRow row = rowByName.get(e.getKey());
            if (row == null) {
                if (!createMissing || nameKey.isBlank()) continue;
                row = rowRepository.save(new PageTableRow(null, blockId, null, nextOrder++, writeJson(Map.of(nameKey, display.get(e.getKey())))));
                created++;
            }
            itemRepository.deleteAllByRow(row.id());
            List<PageTableRowItem> batch = new ArrayList<>();
            int order = 0;
            for (List<String> vals : e.getValue()) {
                Map<String, Object> m = new LinkedHashMap<>();
                for (int n = 0; n < cols.size() && n < detailIdx.size(); n++) m.put(String.valueOf(cols.get(n).get("key")), vals.get(detailIdx.get(n)));
                batch.add(new PageTableRowItem(null, row.id(), order++, writeJson(m)));
            }
            itemRepository.saveAll(batch);
            programs++;
            items += batch.size();
        }
        return Map.of("programs", programs, "items", items, "createdRows", created);
    }

    void clearItems(Long rowId) {
        getRow(rowId);
        itemRepository.deleteAllByRow(rowId);
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
        return new RowView(row.id(), row.groupKey(), row.sortOrder(), readJson(row.data()), itemRepository.countByRowId(row.id()), List.of());
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
