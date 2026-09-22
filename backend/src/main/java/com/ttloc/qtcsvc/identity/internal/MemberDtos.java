package com.ttloc.qtcsvc.identity.internal;

record MemberRequest(String name, String position, String email, String phone, Boolean active, Integer sortOrder) {
}
