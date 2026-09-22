package com.ttloc.qtcsvc.shared;

/**
 * Kieu bao boc rieng cho cot jsonb (dung chung cho moi module can luu JSON
 * tho: report.sections, content.page_blocks.config, content.page_table_rows.data...).
 * KHONG dung String tran lam kieu nguon cho converter jsonb <-> PGobject: neu
 * dung String, Spring se bac cau converter do voi converter Enum->String co
 * san va ap dung NHAM cho moi cot enum/String khac trong toan app (vd
 * users.auth_provider) - da gap loi nay thuc te khi test tao User.
 */
public record Json(String value) {
}
