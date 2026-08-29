package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanOutgoingDocument;

import java.util.List;

class CongVanPublicApiDtos {

    record ListResponse(int total, int page, int pageSize, List<CongVanOutgoingDocument> items) {
    }

    record CategoryItem(int ma, String ten) {
    }

    record CategoriesResponse(List<CategoryItem> soVanBan, List<CategoryItem> loaiVanBan) {
    }

}
