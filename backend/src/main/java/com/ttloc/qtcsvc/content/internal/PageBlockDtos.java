package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.PageBlockType;

import java.util.List;
import java.util.Map;

final class PageBlockDtos {

    private PageBlockDtos() {
    }

    record BlockRequest(PageBlockType type, String title, Map<String, Object> config) {
    }

    record BlockView(Long id, Long categoryId, PageBlockType type, String title, int sortOrder,
                      Map<String, Object> config, List<RowView> rows) {
    }

    record RowRequest(String groupKey, Map<String, Object> data) {
    }

    record RowView(Long id, String groupKey, int sortOrder, Map<String, Object> data) {
    }

    record MoveRequest(Direction direction) {
    }

    enum Direction {UP, DOWN}

}
