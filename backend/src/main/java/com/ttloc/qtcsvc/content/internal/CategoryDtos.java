package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.CategoryKind;

record CategoryRequest(String name, CategoryKind kind, Long parentId, Integer sortOrder, String description) {
}
