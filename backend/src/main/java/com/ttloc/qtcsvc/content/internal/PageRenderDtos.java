package com.ttloc.qtcsvc.content.internal;

import com.ttloc.qtcsvc.content.Category;
import com.ttloc.qtcsvc.content.PageBlockType;
import com.ttloc.qtcsvc.content.Post;
import com.ttloc.qtcsvc.identity.Member;

import java.util.List;
import java.util.Map;

import static com.ttloc.qtcsvc.content.internal.PageBlockDtos.RowView;

final class PageRenderDtos {

    private PageRenderDtos() {
    }

    record PageDetail(Category category, List<Category> breadcrumb, List<Category> children, List<ResolvedBlock> blocks) {
    }

    /**
     * config luon co mat (echo lai cau hinh khoi - vd RICH_TEXT.html,
     * DATA_TABLE.columns/groups/groupLabel). rows/posts/staff chi co du lieu
     * ung voi dung loai khoi, con lai la danh sach rong.
     */
    record ResolvedBlock(Long id, PageBlockType type, String title, Map<String, Object> config,
                          List<RowView> rows, List<Post> posts, List<Member> staff) {
    }

}
