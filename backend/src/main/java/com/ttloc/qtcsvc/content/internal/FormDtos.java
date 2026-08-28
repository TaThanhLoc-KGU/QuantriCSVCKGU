package com.ttloc.qtcsvc.content.internal;

record FormRequest(String title, String description, Long categoryId, Long fileId, String version, Boolean active) {
}
