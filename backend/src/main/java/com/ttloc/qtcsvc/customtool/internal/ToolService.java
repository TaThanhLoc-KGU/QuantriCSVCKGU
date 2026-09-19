package com.ttloc.qtcsvc.customtool.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ttloc.qtcsvc.customtool.CustomTool;
import com.ttloc.qtcsvc.customtool.CustomToolRow;
import com.ttloc.qtcsvc.customtool.CustomToolSubmission;
import com.ttloc.qtcsvc.shared.FileStorageService;
import com.ttloc.qtcsvc.shared.Json;
import com.ttloc.qtcsvc.shared.NotFoundException;
import com.ttloc.qtcsvc.shared.Slugs;
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
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
class ToolService {

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final Set<String> FIELD_TYPES = Set.of("TEXT", "TEXTAREA", "EMAIL", "PHONE", "NUMBER", "DATE", "SELECT", "FILE", "CHECKBOX");
    private static final SecureRandom RANDOM = new SecureRandom();

    record ToolView(Long id, String slug, String name, String description, String kind, Map<String, Object> config,
                     boolean active, int sortOrder, long pending, long rowCount) {
    }

    record ToolRequest(String name, String slug, String description, String kind, Map<String, Object> config, Boolean active, Integer sortOrder) {
    }

    record SubmissionView(Long id, String code, Map<String, Object> data, String status, String resultMessage, Instant createdAt, Instant processedAt) {
    }

    record RowView(Long id, String keyValue, Map<String, Object> data) {
    }

    record ImportPreview(int rowCount, List<String> headers) {
    }

    record PublicTool(String slug, String name, String description, String kind, Map<String, Object> config) {
    }

    record LookupField(String label, String value) {
    }

    private final ToolRepository tools;
    private final ToolSubmissionRepository submissions;
    private final ToolRowRepository rows;
    private final FileStorageService storage;
    private final ObjectMapper mapper;

    ToolService(ToolRepository tools, ToolSubmissionRepository submissions, ToolRowRepository rows, FileStorageService storage, ObjectMapper mapper) {
        this.tools = tools;
        this.submissions = submissions;
        this.rows = rows;
        this.storage = storage;
        this.mapper = mapper;
    }

    // ---------- JSON ----------

    Map<String, Object> read(Json json) {
        if (json == null || json.value() == null || json.value().isBlank()) return new LinkedHashMap<>();
        try {
            return mapper.readValue(json.value(), new TypeReference<LinkedHashMap<String, Object>>() {
            });
        } catch (Exception e) {
            throw new IllegalStateException("Du lieu JSON bi loi", e);
        }
    }

    Json write(Object value) {
        try {
            return new Json(mapper.writeValueAsString(value == null ? Map.of() : value));
        } catch (Exception e) {
            throw new IllegalStateException("Khong ghi duoc JSON", e);
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> listOf(Map<String, Object> config, String key) {
        Object v = config.get(key);
        return v instanceof List<?> l ? (List<Map<String, Object>>) l : List.of();
    }

    private static String str(Object o) {
        return o == null ? "" : o.toString();
    }

    // ---------- Admin: tools ----------

    List<ToolView> list() {
        return tools.findAllByOrderBySortOrderAscIdAsc().stream().map(this::view).toList();
    }

    ToolView get(Long id) {
        return view(require(id));
    }

    CustomTool require(Long id) {
        return tools.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay cong cu: " + id));
    }

    ToolView create(ToolRequest req) {
        if (req.name() == null || req.name().isBlank()) throw new IllegalArgumentException("Tên chức năng không được để trống");
        String kind = "LOOKUP".equals(req.kind()) ? "LOOKUP" : "FORM";
        String slug = uniqueSlug(req.slug() != null && !req.slug().isBlank() ? req.slug() : req.name(), null);
        Map<String, Object> config = req.config() != null ? req.config() : defaultConfig(kind);
        CustomTool saved = tools.save(new CustomTool(null, slug, req.name().trim(), blankToNull(req.description()), kind,
                write(sanitizeConfig(kind, config)), req.active() == null || req.active(), req.sortOrder() == null ? 0 : req.sortOrder(), Instant.now()));
        return view(saved);
    }

    ToolView update(Long id, ToolRequest req) {
        CustomTool t = require(id);
        String slug = t.slug();
        if (req.slug() != null && !req.slug().isBlank() && !req.slug().equals(t.slug())) slug = uniqueSlug(req.slug(), id);
        Map<String, Object> config = req.config() != null ? sanitizeConfig(t.kind(), req.config()) : read(t.config());
        CustomTool saved = tools.save(new CustomTool(t.id(), slug, req.name() != null && !req.name().isBlank() ? req.name().trim() : t.name(),
                req.description() != null ? blankToNull(req.description()) : t.description(), t.kind(), write(config),
                req.active() != null ? req.active() : t.active(), req.sortOrder() != null ? req.sortOrder() : t.sortOrder(), t.createdAt()));
        return view(saved);
    }

    void delete(Long id) {
        require(id);
        tools.deleteById(id);
    }

    private ToolView view(CustomTool t) {
        return new ToolView(t.id(), t.slug(), t.name(), t.description(), t.kind(), read(t.config()), t.active(), t.sortOrder(),
                "FORM".equals(t.kind()) ? submissions.countByToolIdAndStatus(t.id(), "MOI") : 0,
                "LOOKUP".equals(t.kind()) ? rows.countByToolId(t.id()) : 0);
    }

    private Map<String, Object> defaultConfig(String kind) {
        Map<String, Object> c = new LinkedHashMap<>();
        if ("FORM".equals(kind)) {
            c.put("fields", List.of());
            c.put("trackable", true);
            c.put("successMessage", "Đã ghi nhận thông tin của bạn. Vui lòng lưu lại mã hồ sơ để tra cứu.");
            c.put("submitLabel", "Gửi thông tin");
        } else {
            c.put("columns", List.of());
            c.put("keyColumn", "");
            c.put("keyLabel", "Nhập thông tin cần tra cứu");
            c.put("notFoundMessage", "Không tìm thấy thông tin phù hợp.");
        }
        return c;
    }

    /** Chuan hoa cau hinh do quan tri gui len: chi giu cac truong hop le, sinh key neu thieu. */
    private Map<String, Object> sanitizeConfig(String kind, Map<String, Object> in) {
        Map<String, Object> out = new LinkedHashMap<>(in);
        if ("FORM".equals(kind)) {
            List<Map<String, Object>> fields = new ArrayList<>();
            int i = 1;
            for (Map<String, Object> f : listOf(in, "fields")) {
                Map<String, Object> nf = new LinkedHashMap<>();
                String key = str(f.get("key")).isBlank() ? "f" + i : str(f.get("key"));
                nf.put("key", key.replaceAll("[^A-Za-z0-9_]", ""));
                nf.put("label", str(f.get("label")).isBlank() ? "Trường " + i : str(f.get("label")));
                String type = str(f.get("type"));
                nf.put("type", FIELD_TYPES.contains(type) ? type : "TEXT");
                nf.put("required", Boolean.TRUE.equals(f.get("required")));
                nf.put("hint", str(f.get("hint")));
                Object options = f.get("options");
                nf.put("options", options instanceof List<?> l ? l.stream().map(Object::toString).filter(s -> !s.isBlank()).toList() : List.of());
                fields.add(nf);
                i++;
            }
            out.put("fields", fields);
        } else {
            List<Map<String, Object>> cols = new ArrayList<>();
            int i = 1;
            for (Map<String, Object> c : listOf(in, "columns")) {
                Map<String, Object> nc = new LinkedHashMap<>();
                nc.put("key", str(c.get("key")).isBlank() ? "c" + i : str(c.get("key")));
                nc.put("label", str(c.get("label")).isBlank() ? "Cột " + i : str(c.get("label")));
                nc.put("show", !Boolean.FALSE.equals(c.get("show")));
                cols.add(nc);
                i++;
            }
            out.put("columns", cols);
        }
        return out;
    }

    private String uniqueSlug(String base, Long excludeId) {
        String slug = Slugs.slugify(base);
        if (slug.isBlank()) slug = "cong-cu";
        String candidate = slug;
        int n = 2;
        while (true) {
            var existing = tools.findBySlug(candidate);
            if (existing.isEmpty() || existing.get().id().equals(excludeId)) return candidate;
            candidate = slug + "-" + n++;
        }
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.trim();
    }

    // ---------- Admin: submissions ----------

    List<SubmissionView> submissionsOf(Long toolId) {
        require(toolId);
        return submissions.findByToolIdOrderByCreatedAtDesc(toolId).stream().map(this::view).toList();
    }

    private SubmissionView view(CustomToolSubmission s) {
        return new SubmissionView(s.id(), s.code(), read(s.data()), s.status(), s.resultMessage(), s.createdAt(), s.processedAt());
    }

    SubmissionView updateSubmission(Long id, String status, String resultMessage) {
        CustomToolSubmission s = submissions.findById(id).orElseThrow(() -> new NotFoundException("Khong tim thay ho so: " + id));
        String st = Set.of("MOI", "DA_XU_LY", "TU_CHOI").contains(status) ? status : s.status();
        return view(submissions.save(new CustomToolSubmission(s.id(), s.toolId(), s.code(), s.data(), st,
                resultMessage != null ? blankToNull(resultMessage) : s.resultMessage(), s.createdAt(),
                "MOI".equals(st) ? null : Instant.now())));
    }

    void deleteSubmission(Long id) {
        submissions.deleteById(id);
    }

    /** Tra ve {objectKey, name} cua file dinh kem o truong fieldKey trong 1 ho so. */
    @SuppressWarnings("unchecked")
    Map<String, Object> fileOf(Long submissionId, String fieldKey) {
        CustomToolSubmission s = submissions.findById(submissionId).orElseThrow(() -> new NotFoundException("Khong tim thay ho so"));
        Object v = read(s.data()).get(fieldKey);
        if (v instanceof Map<?, ?> m && m.get("objectKey") != null) return (Map<String, Object>) m;
        throw new NotFoundException("Khong co tep dinh kem");
    }

    FileStorageService storage() {
        return storage;
    }

    // ---------- Admin: lookup rows ----------

    List<RowView> searchRows(Long toolId, String q) {
        require(toolId);
        return rows.search(toolId, q == null ? "" : q.trim(), 50).stream().map(r -> new RowView(r.id(), r.keyValue(), read(r.data()))).toList();
    }

    @Transactional
    Object importRows(Long toolId, MultipartFile file, boolean commit) {
        CustomTool t = require(toolId);
        if (!"LOOKUP".equals(t.kind())) throw new IllegalArgumentException("Chỉ chức năng tra cứu mới nhập được dữ liệu bảng");
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
                Row row = sheet.getRow(r);
                if (row == null) continue;
                List<String> vals = new ArrayList<>();
                boolean any = false;
                for (int c = 0; c < cols; c++) {
                    Cell cell = row.getCell(c);
                    String v = cell == null ? "" : fmt.formatCellValue(cell).trim();
                    if (!v.isEmpty()) any = true;
                    vals.add(v);
                }
                if (any) data.add(vals);
            }
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được file Excel", e);
        }
        if (!commit) return new ImportPreview(data.size(), headers);

        Map<String, Object> config = read(t.config());
        List<Map<String, Object>> oldCols = listOf(config, "columns");
        List<Map<String, Object>> cols = new ArrayList<>();
        for (int i = 0; i < headers.size(); i++) {
            Map<String, Object> c = new LinkedHashMap<>();
            c.put("key", "c" + (i + 1));
            c.put("label", headers.get(i));
            // Cot nhay cam (mat khau, ngay sinh, CCCD...) mac dinh KHONG hien cho nguoi tra cuu; quan tri co the bat lai.
            boolean show = !headers.get(i).toLowerCase().matches(".*(mật khẩu|password|ngày sinh|cccd|căn cước|cmnd).*");
            for (Map<String, Object> oc : oldCols) if (headers.get(i).equals(str(oc.get("label")))) show = !Boolean.FALSE.equals(oc.get("show"));
            c.put("show", show);
            cols.add(c);
        }
        config.put("columns", cols);
        String keyCol = str(config.get("keyColumn"));
        if (cols.stream().noneMatch(c -> keyCol.equals(str(c.get("key"))))) config.put("keyColumn", "c1");
        String keyKey = str(config.get("keyColumn"));
        tools.save(new CustomTool(t.id(), t.slug(), t.name(), t.description(), t.kind(), write(config), t.active(), t.sortOrder(), t.createdAt()));

        int keyIdx = Integer.parseInt(keyKey.substring(1)) - 1;
        rows.deleteAllByTool(toolId);
        List<CustomToolRow> batch = new ArrayList<>();
        for (List<String> vals : data) {
            Map<String, Object> m = new LinkedHashMap<>();
            for (int i = 0; i < vals.size(); i++) m.put("c" + (i + 1), vals.get(i));
            batch.add(new CustomToolRow(null, toolId, vals.get(keyIdx), write(m)));
        }
        rows.saveAll(batch);
        return Map.of("importedCount", batch.size());
    }

    @Transactional
    void changeKeyColumn(Long toolId, String keyColumn) {
        CustomTool t = require(toolId);
        Map<String, Object> config = read(t.config());
        config.put("keyColumn", keyColumn);
        tools.save(new CustomTool(t.id(), t.slug(), t.name(), t.description(), t.kind(), write(config), t.active(), t.sortOrder(), t.createdAt()));
        List<CustomToolRow> updated = new ArrayList<>();
        for (CustomToolRow r : rows.search(toolId, "", Integer.MAX_VALUE)) {
            updated.add(new CustomToolRow(r.id(), toolId, str(read(r.data()).get(keyColumn)), r.data()));
        }
        rows.saveAll(updated);
    }

    // ---------- Public ----------

    List<PublicTool> publicList() {
        return tools.findByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map(t -> new PublicTool(t.slug(), t.name(), t.description(), t.kind(), Map.of())).toList();
    }

    PublicTool publicTool(String slug) {
        CustomTool t = active(slug);
        Map<String, Object> config = read(t.config());
        // Khong lo du lieu nhay cam: chi tra cau hinh hien thi (truong nhap, thong bao), khong tra hang du lieu.
        return new PublicTool(t.slug(), t.name(), t.description(), t.kind(), config);
    }

    private CustomTool active(String slug) {
        CustomTool t = tools.findBySlug(slug).orElseThrow(() -> new NotFoundException("Không tìm thấy chức năng này."));
        if (!t.active()) throw new NotFoundException("Chức năng này hiện đang tạm dừng.");
        return t;
    }

    Map<String, String> submit(String slug, Map<String, String> values, Map<String, MultipartFile> files) {
        CustomTool t = active(slug);
        if (!"FORM".equals(t.kind())) throw new IllegalArgumentException("Chức năng này không nhận thông tin.");
        Map<String, Object> config = read(t.config());
        Map<String, Object> data = new LinkedHashMap<>();
        for (Map<String, Object> f : listOf(config, "fields")) {
            String key = str(f.get("key"));
            String label = str(f.get("label"));
            String type = str(f.get("type"));
            boolean required = Boolean.TRUE.equals(f.get("required"));
            if ("FILE".equals(type)) {
                MultipartFile file = files.get(key);
                if (file == null || file.isEmpty()) {
                    if (required) throw new IllegalArgumentException("Vui lòng đính kèm: " + label);
                    continue;
                }
                if (file.getSize() > 15L * 1024 * 1024) throw new IllegalArgumentException("Tệp \"" + label + "\" vượt quá 15MB");
                try {
                    var stored = storage.upload("custom-tools", file.getOriginalFilename(), file.getContentType(), file.getInputStream(), file.getSize());
                    data.put(key, Map.of("objectKey", stored.objectKey(), "name", str(stored.originalName())));
                } catch (IOException e) {
                    throw new IllegalStateException("Không đọc được tệp đính kèm", e);
                }
                continue;
            }
            String v = values.getOrDefault(key, "").trim();
            if (v.isEmpty()) {
                if (required && !"CHECKBOX".equals(type)) throw new IllegalArgumentException("Vui lòng nhập: " + label);
                if (!"CHECKBOX".equals(type)) continue;
            }
            if (v.length() > 5000) throw new IllegalArgumentException("\"" + label + "\" quá dài");
            if ("EMAIL".equals(type) && !v.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) throw new IllegalArgumentException("Email không hợp lệ: " + label);
            if ("NUMBER".equals(type) && !v.matches("^-?\\d+([.,]\\d+)?$")) throw new IllegalArgumentException("\"" + label + "\" phải là số");
            if ("SELECT".equals(type)) {
                Object opts = f.get("options");
                if (!(opts instanceof List<?> l) || !l.contains(v)) throw new IllegalArgumentException("Giá trị không hợp lệ: " + label);
            }
            if ("CHECKBOX".equals(type)) v = "true".equals(v) ? "Có" : "Không";
            data.put(key, v);
        }
        String code = newCode();
        submissions.save(new CustomToolSubmission(null, t.id(), code, write(data), "MOI", null, Instant.now(), null));
        String msg = str(config.get("successMessage"));
        return Map.of("code", code, "message", msg.isBlank() ? "Đã ghi nhận thông tin của bạn." : msg,
                "trackable", String.valueOf(!Boolean.FALSE.equals(config.get("trackable"))));
    }

    private String newCode() {
        while (true) {
            StringBuilder sb = new StringBuilder("YC-");
            for (int i = 0; i < 8; i++) sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            if (!submissions.existsByCode(sb.toString())) return sb.toString();
        }
    }

    Map<String, Object> status(String slug, String code) {
        CustomTool t = active(slug);
        CustomToolSubmission s = submissions.findByToolIdAndCodeIgnoreCase(t.id(), code == null ? "" : code.trim())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hồ sơ với mã này."));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("status", s.status());
        out.put("resultMessage", s.resultMessage());
        out.put("createdAt", s.createdAt());
        out.put("processedAt", s.processedAt());
        return out;
    }

    List<LookupField> lookup(String slug, String query) {
        CustomTool t = active(slug);
        if (!"LOOKUP".equals(t.kind())) throw new IllegalArgumentException("Chức năng này không hỗ trợ tra cứu.");
        Map<String, Object> config = read(t.config());
        String notFound = str(config.get("notFoundMessage")).isBlank() ? "Không tìm thấy thông tin phù hợp." : str(config.get("notFoundMessage"));
        if (query == null || query.isBlank()) throw new NotFoundException(notFound);
        CustomToolRow row = rows.findByKey(t.id(), query.trim()).orElseThrow(() -> new NotFoundException(notFound));
        Map<String, Object> data = read(row.data());
        List<LookupField> out = new ArrayList<>();
        for (Map<String, Object> c : listOf(config, "columns")) {
            if (Boolean.FALSE.equals(c.get("show"))) continue;
            String v = str(data.get(str(c.get("key"))));
            if (!v.isBlank()) out.add(new LookupField(str(c.get("label")), v));
        }
        return out;
    }

}
