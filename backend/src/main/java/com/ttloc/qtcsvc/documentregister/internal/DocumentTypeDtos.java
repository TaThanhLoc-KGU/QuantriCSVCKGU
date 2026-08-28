package com.ttloc.qtcsvc.documentregister.internal;

import com.ttloc.qtcsvc.documentregister.Direction;

record DocumentTypeRequest(String code, String name, String symbolCode, Direction direction,
                            Boolean resetYearly, Integer sortOrder, Boolean active) {
}
