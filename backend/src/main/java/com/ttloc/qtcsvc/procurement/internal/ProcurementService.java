package com.ttloc.qtcsvc.procurement.internal;

import com.ttloc.qtcsvc.procurement.ProcurementItem;
import com.ttloc.qtcsvc.procurement.ProcurementLine;
import com.ttloc.qtcsvc.procurement.ProcurementRound;
import com.ttloc.qtcsvc.procurement.ProcurementSubmission;
import com.ttloc.qtcsvc.procurement.ProcurementUnit;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.CatalogItem;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.DetailLine;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.FormView;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.ItemRequest;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.LineValue;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.RoundRequest;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.RoundView;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SaveLine;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SaveRequest;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SaveResult;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.StatusRow;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SubmissionDetail;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SummaryRow;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.SummaryView;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.UnitRef;
import com.ttloc.qtcsvc.procurement.internal.ProcurementDtos.UnitRequest;
import com.ttloc.qtcsvc.shared.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
class ProcurementService {

    static final Set<String> AUDIENCES = Set.of("PHONG", "KHOA");
    private static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int MAX_QTY = 9999;
    private static final int MAX_LINES = 500;

    private final UnitRepository units;
    private final ItemRepository items;
    private final RoundRepository rounds;
    private final SubmissionRepository submissions;
    private final LineRepository lines;

    ProcurementService(UnitRepository units, ItemRepository items, RoundRepository rounds,
                       SubmissionRepository submissions, LineRepository lines) {
        this.units = units;
        this.items = items;
        this.rounds = rounds;
        this.submissions = submissions;
        this.lines = lines;
    }

    // ---------- Dot (round) ----------

    RoundView view(ProcurementRound r) {
        boolean open = r.accepting() && (r.deadline() == null || !Instant.now().isAfter(r.deadline()));
        return new RoundView(r.id(), r.audience(), r.name(), r.deadline(),
                r.deadline() == null ? null : r.deadline().atZone(ZONE).toLocalDate(),
                r.accepting(), r.showPrevious(), open, r.createdAt());
    }

    ProcurementRound round(Long id) {
        return rounds.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy đợt mua sắm: " + id));
    }

    List<RoundView> listRounds(String audience) {
        return rounds.findByAudienceOrderByCreatedAtDesc(audience(audience)).stream().map(this::view).toList();
    }

    List<RoundView> openRounds() {
        return rounds.findByAcceptingTrueOrderByCreatedAtDesc().stream().map(this::view).filter(RoundView::open).toList();
    }

    @Transactional
    RoundView createRound(RoundRequest req) {
        String name = requireText(req.name(), "Vui lòng nhập tên đợt.", 200);
        ProcurementRound saved = rounds.save(new ProcurementRound(null, audience(req.audience()), name,
                deadlineOf(req.deadlineDate()), req.accepting() == null || req.accepting(),
                Boolean.TRUE.equals(req.showPrevious()), Instant.now()));
        return view(saved);
    }

    @Transactional
    RoundView updateRound(Long id, RoundRequest req) {
        ProcurementRound old = round(id);
        String name = requireText(req.name(), "Vui lòng nhập tên đợt.", 200);
        ProcurementRound saved = rounds.save(new ProcurementRound(old.id(), old.audience(), name,
                deadlineOf(req.deadlineDate()), req.accepting() == null ? old.accepting() : req.accepting(),
                req.showPrevious() == null ? old.showPrevious() : req.showPrevious(), old.createdAt()));
        return view(saved);
    }

    @Transactional
    void deleteRound(Long id) {
        round(id);
        rounds.deleteById(id);
    }

    private Instant deadlineOf(java.time.LocalDate date) {
        return date == null ? null : date.atTime(23, 59, 59).atZone(ZONE).toInstant();
    }

    // ---------- Don vi ----------

    List<ProcurementUnit> listUnits(String audience) {
        return units.findByAudienceOrderBySortOrderAscIdAsc(audience(audience));
    }

    @Transactional
    ProcurementUnit createUnit(UnitRequest req) {
        String audience = audience(req.audience());
        String code = requireText(req.code(), "Vui lòng nhập mã đơn vị.", 50);
        if (units.findByAudienceAndCode(audience, code).isPresent()) {
            throw new IllegalArgumentException("Mã đơn vị \"" + code + "\" đã tồn tại.");
        }
        int order = req.sortOrder() != null ? req.sortOrder() : listUnits(audience).size() + 1;
        return units.save(new ProcurementUnit(null, audience, code,
                requireText(req.name(), "Vui lòng nhập tên đơn vị.", 200), order,
                req.active() == null || req.active()));
    }

    @Transactional
    ProcurementUnit updateUnit(Long id, UnitRequest req) {
        ProcurementUnit old = units.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy đơn vị: " + id));
        String code = requireText(req.code(), "Vui lòng nhập mã đơn vị.", 50);
        if (!code.equals(old.code()) && units.findByAudienceAndCode(old.audience(), code).isPresent()) {
            throw new IllegalArgumentException("Mã đơn vị \"" + code + "\" đã tồn tại.");
        }
        return units.save(new ProcurementUnit(old.id(), old.audience(), code,
                requireText(req.name(), "Vui lòng nhập tên đơn vị.", 200),
                req.sortOrder() == null ? old.sortOrder() : req.sortOrder(),
                req.active() == null ? old.active() : req.active()));
    }

    @Transactional
    void deleteUnit(Long id) {
        if (submissions.existsByUnitId(id)) {
            throw new IllegalArgumentException("Đơn vị này đã có số liệu đăng ký, không xóa được. Hãy tắt \"Hiển thị\" để ẩn khỏi ô chọn.");
        }
        units.deleteById(id);
    }

    // ---------- Danh muc hang ----------

    List<ProcurementItem> listItems(String audience) {
        return items.findByAudienceOrderBySortOrderAscIdAsc(audience(audience));
    }

    @Transactional
    ProcurementItem createItem(ItemRequest req) {
        String audience = audience(req.audience());
        String code = requireText(req.code(), "Vui lòng nhập mã hàng.", 50);
        if (items.findByAudienceAndCode(audience, code).isPresent()) {
            throw new IllegalArgumentException("Mã hàng \"" + code + "\" đã tồn tại.");
        }
        int order = req.sortOrder() != null ? req.sortOrder() : listItems(audience).size() + 1;
        return items.save(new ProcurementItem(null, audience, code, groupOf(req.groupName()),
                requireText(req.name(), "Vui lòng nhập tên hàng.", 300), orEmpty(text(req.unitLabel(), 50)), order,
                req.visible() == null || req.visible()));
    }

    @Transactional
    ProcurementItem updateItem(Long id, ItemRequest req) {
        ProcurementItem old = items.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy mặt hàng: " + id));
        String code = requireText(req.code(), "Vui lòng nhập mã hàng.", 50);
        if (!code.equals(old.code()) && items.findByAudienceAndCode(old.audience(), code).isPresent()) {
            throw new IllegalArgumentException("Mã hàng \"" + code + "\" đã tồn tại.");
        }
        return items.save(new ProcurementItem(old.id(), old.audience(), code, groupOf(req.groupName()),
                requireText(req.name(), "Vui lòng nhập tên hàng.", 300), orEmpty(text(req.unitLabel(), 50)),
                req.sortOrder() == null ? old.sortOrder() : req.sortOrder(),
                req.visible() == null ? old.visible() : req.visible()));
    }

    @Transactional
    void deleteItem(Long id) {
        items.deleteById(id);
    }

    /**
     * Gan ma cho dong chua co ma: trung ten voi mat hang da co thi dung lai ma do (cap nhat),
     * con lai tu tang theo tien to (VPP cho phong, KH cho khoa) tiep sau ma lon nhat hien co.
     */
    List<ProcurementItem> resolveCodes(String audience, List<ProcurementItem> parsed) {
        String aud = audience(audience);
        String prefix = "KHOA".equals(aud) ? "KH" : "VPP";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("^" + prefix + "(\\d+)$", java.util.regex.Pattern.CASE_INSENSITIVE);
        Map<String, String> codeByName = new HashMap<>();
        Set<String> used = new java.util.HashSet<>();
        int max = 0;
        for (ProcurementItem e : items.findByAudienceOrderBySortOrderAscIdAsc(aud)) {
            codeByName.put(ProcurementExcel.normalizeName(e.name()), e.code());
            used.add(e.code());
            var m = pattern.matcher(e.code());
            if (m.matches()) {
                max = Math.max(max, Integer.parseInt(m.group(1)));
            }
        }
        for (ProcurementItem p : parsed) {
            if (p.code() != null) {
                used.add(p.code());
            }
        }
        int next = max + 1;
        List<ProcurementItem> out = new ArrayList<>();
        for (ProcurementItem p : parsed) {
            String code = p.code();
            if (code == null) {
                code = codeByName.get(ProcurementExcel.normalizeName(p.name()));
            }
            if (code == null) {
                String candidate;
                do {
                    candidate = prefix + String.format("%03d", next++);
                } while (used.contains(candidate));
                used.add(candidate);
                code = candidate;
            }
            out.add(new ProcurementItem(null, aud, code, p.groupName(), p.name(), p.unitLabel(), p.sortOrder(), p.visible()));
        }
        return out;
    }

    /** Them moi mat hang chua co (theo ma, xuong cuoi danh muc), cap nhat mat hang da co (giu nguyen thu tu). */
    @Transactional
    ProcurementDtos.ImportResult upsertItems(String audience, List<ProcurementItem> resolved) {
        String aud = audience(audience);
        Map<String, ProcurementItem> existing = new HashMap<>();
        int maxOrder = 0;
        for (ProcurementItem i : items.findByAudienceOrderBySortOrderAscIdAsc(aud)) {
            existing.put(i.code(), i);
            maxOrder = Math.max(maxOrder, i.sortOrder());
        }
        List<ProcurementItem> toSave = new ArrayList<>();
        int added = 0;
        int updated = 0;
        for (ProcurementItem p : resolved) {
            ProcurementItem old = existing.get(p.code());
            if (old == null) {
                toSave.add(new ProcurementItem(null, aud, p.code(), p.groupName(), p.name(), p.unitLabel(), ++maxOrder, p.visible()));
                added++;
            } else {
                toSave.add(new ProcurementItem(old.id(), aud, p.code(), p.groupName(), p.name(), p.unitLabel(), old.sortOrder(), p.visible()));
                updated++;
            }
        }
        items.saveAll(toSave);
        return new ProcurementDtos.ImportResult(added, updated);
    }

    int countExisting(String audience, List<ProcurementItem> parsed) {
        Set<String> codes = items.findByAudienceOrderBySortOrderAscIdAsc(audience(audience)).stream()
                .map(ProcurementItem::code).collect(Collectors.toSet());
        return (int) parsed.stream().filter(p -> codes.contains(p.code())).count();
    }

    // ---------- Trang cong khai ----------

    ProcurementDtos.PublicRoundDetail publicRound(Long roundId) {
        ProcurementRound r = round(roundId);
        List<UnitRef> refs = units.findByAudienceOrderBySortOrderAscIdAsc(r.audience()).stream()
                .filter(ProcurementUnit::active).map(this::ref).toList();
        return new ProcurementDtos.PublicRoundDetail(view(r), refs);
    }

    FormView form(Long roundId, Long unitId) {
        ProcurementRound r = round(roundId);
        ProcurementUnit u = unitOf(r, unitId);
        List<CatalogItem> catalog = items.findByAudienceOrderBySortOrderAscIdAsc(r.audience()).stream()
                .filter(ProcurementItem::visible)
                .map(i -> new CatalogItem(i.code(), i.groupName(), i.name(), i.unitLabel())).toList();
        Map<String, LineValue> values = new LinkedHashMap<>();
        String generalNote = "";
        Instant updatedAt = null;
        var sub = submissions.findByRoundIdAndUnitId(roundId, unitId);
        if (sub.isPresent()) {
            updatedAt = sub.get().updatedAt();
            if (r.showPrevious()) {
                generalNote = sub.get().generalNote() == null ? "" : sub.get().generalNote();
                for (ProcurementLine l : lines.findBySubmissionIdOrderById(sub.get().id())) {
                    values.put(l.itemCode(), new LineValue(l.qty(), l.note() == null ? "" : l.note()));
                }
            }
        }
        return new FormView(view(r), ref(u), catalog, values, generalNote, updatedAt);
    }

    /** Thay toan bo so lieu cua don vi trong dot nay bang ban moi (giong luong Apps Script cu). */
    @Transactional
    SaveResult save(Long roundId, Long unitId, SaveRequest req) {
        ProcurementRound r = round(roundId);
        if (!view(r).open()) {
            throw new IllegalArgumentException("Đợt đăng ký đã khóa, không thể lưu thay đổi.");
        }
        ProcurementUnit u = unitOf(r, unitId);

        Map<String, ProcurementItem> catalog = new HashMap<>();
        for (ProcurementItem i : items.findByAudienceOrderBySortOrderAscIdAsc(r.audience())) {
            if (i.visible()) {
                catalog.put(i.code(), i);
            }
        }
        List<SaveLine> input = req.items() == null ? List.of() : req.items();
        if (input.size() > MAX_LINES) {
            throw new IllegalArgumentException("Số mặt hàng gửi lên quá nhiều.");
        }

        Map<String, ProcurementLine> merged = new LinkedHashMap<>();
        int total = 0;
        for (SaveLine in : input) {
            ProcurementItem item = in.code() == null ? null : catalog.get(in.code().trim());
            if (item == null || in.qty() == null || in.qty() <= 0) {
                continue;
            }
            if (in.qty() > MAX_QTY) {
                throw new IllegalArgumentException("Số lượng \"" + item.name() + "\" vượt quá " + MAX_QTY + ".");
            }
            if (merged.containsKey(item.code())) {
                continue;
            }
            merged.put(item.code(), new ProcurementLine(null, null, item.code(), item.name(), item.unitLabel(),
                    in.qty(), text(in.note(), 200)));
            total += in.qty();
        }

        Instant now = Instant.now();
        var existing = submissions.findByRoundIdAndUnitId(roundId, unitId);
        String note = text(req.generalNote(), 1000);
        ProcurementSubmission sub = submissions.save(new ProcurementSubmission(
                existing.map(ProcurementSubmission::id).orElse(null), roundId, u.id(), note,
                existing.map(s -> s.timesSaved() + 1).orElse(1), now));
        lines.deleteAllBySubmission(sub.id());
        lines.saveAll(merged.values().stream()
                .map(l -> new ProcurementLine(null, sub.id(), l.itemCode(), l.itemName(), l.unitLabel(), l.qty(), l.note()))
                .toList());
        return new SaveResult(now, merged.size(), total);
    }

    // ---------- Admin: theo doi + tong hop ----------

    List<StatusRow> status(Long roundId) {
        ProcurementRound r = round(roundId);
        Map<Long, ProcurementSubmission> subs = submissions.findByRoundId(roundId).stream()
                .collect(Collectors.toMap(ProcurementSubmission::unitId, s -> s));
        Map<Long, List<ProcurementLine>> byUnit = linesByUnit(subs);
        List<StatusRow> out = new ArrayList<>();
        for (ProcurementUnit u : unitsForRound(r, subs.keySet())) {
            ProcurementSubmission s = subs.get(u.id());
            List<ProcurementLine> ls = byUnit.getOrDefault(u.id(), List.of());
            out.add(new StatusRow(u.id(), u.code(), u.name(), s != null, ls.size(),
                    ls.stream().mapToInt(ProcurementLine::qty).sum(),
                    s == null ? null : s.generalNote(), s == null ? null : s.updatedAt(),
                    s == null ? 0 : s.timesSaved()));
        }
        return out;
    }

    SummaryView summary(Long roundId) {
        ProcurementRound r = round(roundId);
        Map<Long, ProcurementSubmission> subs = submissions.findByRoundId(roundId).stream()
                .collect(Collectors.toMap(ProcurementSubmission::unitId, s -> s));
        Map<Long, List<ProcurementLine>> byUnit = linesByUnit(subs);
        List<ProcurementUnit> cols = unitsForRound(r, subs.keySet());

        Map<String, ProcurementItem> catalog = new LinkedHashMap<>();
        for (ProcurementItem i : items.findByAudienceOrderBySortOrderAscIdAsc(r.audience())) {
            catalog.put(i.code(), i);
        }
        Map<String, Map<Long, Integer>> qty = new HashMap<>();
        Map<String, DetailLine> snapshot = new LinkedHashMap<>();
        for (ProcurementUnit u : cols) {
            for (ProcurementLine l : byUnit.getOrDefault(u.id(), List.of())) {
                qty.computeIfAbsent(l.itemCode(), k -> new HashMap<>()).merge(u.id(), l.qty(), Integer::sum);
                snapshot.putIfAbsent(l.itemCode(), new DetailLine(l.itemCode(), l.itemName(), l.unitLabel(), 0, null));
            }
        }

        List<SummaryRow> rows = new ArrayList<>();
        for (ProcurementItem i : catalog.values()) {
            Map<Long, Integer> m = qty.getOrDefault(i.code(), Map.of());
            if (!i.visible() && m.isEmpty()) {
                continue;
            }
            rows.add(new SummaryRow(i.code(), i.groupName(), i.name(), i.unitLabel(), m,
                    m.values().stream().mapToInt(Integer::intValue).sum()));
        }
        for (Map.Entry<String, DetailLine> e : snapshot.entrySet()) {
            if (!catalog.containsKey(e.getKey())) {
                Map<Long, Integer> m = qty.get(e.getKey());
                rows.add(new SummaryRow(e.getKey(), "Khác", e.getValue().name(), e.getValue().unit(), m,
                        m.values().stream().mapToInt(Integer::intValue).sum()));
            }
        }
        return new SummaryView(cols.stream().map(this::ref).toList(), rows);
    }

    SubmissionDetail detail(Long roundId, Long unitId) {
        ProcurementRound r = round(roundId);
        ProcurementUnit u = unitOf(r, unitId);
        ProcurementSubmission s = submissions.findByRoundIdAndUnitId(roundId, unitId)
                .orElseThrow(() -> new NotFoundException("Đơn vị này chưa gửi đăng ký trong đợt này."));
        List<DetailLine> ls = lines.findBySubmissionIdOrderById(s.id()).stream()
                .map(l -> new DetailLine(l.itemCode(), l.itemName(), l.unitLabel(), l.qty(), l.note())).toList();
        return new SubmissionDetail(ref(u), s.generalNote(), s.updatedAt(), s.timesSaved(), ls);
    }

    @Transactional
    void clearSubmission(Long roundId, Long unitId) {
        submissions.findByRoundIdAndUnitId(roundId, unitId).ifPresent(s -> submissions.deleteById(s.id()));
    }

    // ---------- Du lieu cho file Excel ----------

    record ExportData(ProcurementRound round, SummaryView summary, List<StatusRow> status,
                      List<ExportLine> lines) {
    }

    record ExportLine(String unitCode, String unitName, String itemCode, String itemName, String unitLabel,
                      int qty, String note, Instant updatedAt) {
    }

    ExportData exportData(Long roundId) {
        ProcurementRound r = round(roundId);
        SummaryView summary = summary(roundId);
        List<StatusRow> status = status(roundId);

        Map<Long, ProcurementSubmission> subs = submissions.findByRoundId(roundId).stream()
                .collect(Collectors.toMap(ProcurementSubmission::unitId, s -> s));
        Map<Long, ProcurementUnit> unitById = new HashMap<>();
        for (ProcurementUnit u : units.findByAudienceOrderBySortOrderAscIdAsc(r.audience())) {
            unitById.put(u.id(), u);
        }
        Map<Long, List<ProcurementLine>> byUnit = linesByUnit(subs);
        List<ExportLine> out = new ArrayList<>();
        for (ProcurementUnit u : unitsForRound(r, subs.keySet())) {
            ProcurementSubmission s = subs.get(u.id());
            for (ProcurementLine l : byUnit.getOrDefault(u.id(), List.of())) {
                out.add(new ExportLine(u.code(), u.name(), l.itemCode(), l.itemName(), l.unitLabel(), l.qty(),
                        l.note(), s.updatedAt()));
            }
        }
        return new ExportData(r, summary, status, out);
    }

    // ---------- Noi bo ----------

    private List<ProcurementUnit> unitsForRound(ProcurementRound r, Set<Long> unitIdsWithData) {
        return units.findByAudienceOrderBySortOrderAscIdAsc(r.audience()).stream()
                .filter(u -> u.active() || unitIdsWithData.contains(u.id())).toList();
    }

    private Map<Long, List<ProcurementLine>> linesByUnit(Map<Long, ProcurementSubmission> subs) {
        if (subs.isEmpty()) {
            return Map.of();
        }
        Map<Long, Long> unitBySub = new HashMap<>();
        subs.forEach((unitId, s) -> unitBySub.put(s.id(), unitId));
        Map<Long, List<ProcurementLine>> out = new HashMap<>();
        for (ProcurementLine l : lines.findBySubmissionIdInOrderById(new ArrayList<>(unitBySub.keySet()))) {
            out.computeIfAbsent(unitBySub.get(l.submissionId()), k -> new ArrayList<>()).add(l);
        }
        return out;
    }

    private ProcurementUnit unitOf(ProcurementRound r, Long unitId) {
        ProcurementUnit u = units.findById(unitId).orElseThrow(() -> new IllegalArgumentException("Vui lòng chọn đơn vị."));
        if (!u.audience().equals(r.audience()) || !u.active()) {
            throw new IllegalArgumentException("Đơn vị không thuộc đợt đăng ký này.");
        }
        return u;
    }

    private UnitRef ref(ProcurementUnit u) {
        return new UnitRef(u.id(), u.code(), u.name());
    }

    static String audience(String a) {
        String v = a == null ? "" : a.trim().toUpperCase();
        if (!AUDIENCES.contains(v)) {
            throw new IllegalArgumentException("Đối tượng phải là PHONG hoặc KHOA.");
        }
        return v;
    }

    private static String orEmpty(String s) {
        return s == null ? "" : s;
    }

    private static String groupOf(String g) {
        String v = text(g, 100);
        return v == null ? "Khác" : v;
    }

    private static String requireText(String s, String message, int max) {
        String v = text(s, max);
        if (v == null) {
            throw new IllegalArgumentException(message);
        }
        return v;
    }

    private static String text(String s, int max) {
        if (s == null || s.isBlank()) {
            return null;
        }
        String v = s.trim();
        if (v.length() > max) {
            throw new IllegalArgumentException("Nội dung quá dài (tối đa " + max + " ký tự).");
        }
        return v;
    }

}
