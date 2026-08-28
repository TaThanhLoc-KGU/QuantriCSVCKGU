package com.ttloc.qtcsvc.content.internal;

record PostRequest(String title, String summary, String content, String thumbnailUrl, Long categoryId,
                    Boolean featured, Boolean pinned, Boolean publish) {
}

record PostStatusRequest(Boolean publish) {
}
