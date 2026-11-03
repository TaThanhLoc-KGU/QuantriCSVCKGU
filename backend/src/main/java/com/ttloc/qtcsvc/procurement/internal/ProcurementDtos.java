package com.ttloc.qtcsvc.procurement.internal;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

final class ProcurementDtos {

    private ProcurementDtos() {
    }

    record RoundView(Long id, String audience, String name, Instant deadline, LocalDate deadlineDate,
                     boolean accepting, boolean showPrevious, boolean open, Instant createdAt) {
    }

    record RoundRequest(String audience, String name, LocalDate deadlineDate, Boolean accepting, Boolean showPrevious) {
    }

    record UnitRequest(String audience, String code, String name, Integer sortOrder, Boolean active) {
    }

    record ItemRequest(String audience, String code, String groupName, String name, String unitLabel,
                       Integer sortOrder, Boolean visible) {
    }

    record UnitRef(Long id, String code, String name) {
    }

    record CatalogItem(String code, String group, String name, String unit) {
    }

    record LineValue(int qty, String note) {
    }

    record PublicRoundList(List<RoundView> rounds) {
    }

    record PublicRoundDetail(RoundView round, List<UnitRef> units) {
    }

    record FormView(RoundView round, UnitRef unit, List<CatalogItem> catalog, Map<String, LineValue> values,
                    String generalNote, Instant updatedAt) {
    }

    record SaveLine(String code, Integer qty, String note) {
    }

    record SaveRequest(List<SaveLine> items, String generalNote) {
    }

    record SaveResult(Instant savedAt, int count, int totalQty) {
    }

    record StatusRow(Long unitId, String unitCode, String unitName, boolean submitted, int itemCount, int totalQty,
                     String generalNote, Instant updatedAt, int timesSaved) {
    }

    record SummaryRow(String code, String group, String name, String unit, Map<Long, Integer> qtyByUnit, int total) {
    }

    record SummaryView(List<UnitRef> units, List<SummaryRow> rows) {
    }

    record DetailLine(String code, String name, String unit, int qty, String note) {
    }

    record SubmissionDetail(UnitRef unit, String generalNote, Instant updatedAt, int timesSaved, List<DetailLine> lines) {
    }

    record HandoverLine(String name, String unit, int qty, String note) {
    }

    record HandoverRequest(LocalDate date, String giverName, String giverAddress, String receiverName,
                           String receiverAddress, String place, String content, List<HandoverLine> lines) {
    }

    record ImportPreview(int validCount, int newCount, int updateCount, List<String> errors) {
    }

    record ImportResult(int addedCount, int updatedCount) {
    }

}
