package com.ttloc.qtcsvc.tasks;

/**
 * Phat sinh khi 1 Task chuyen sang trang thai HOAN_THANH (du la doi thu cong
 * qua changeStatus hay tu dong tinh tu cac buoc). Cac module khac (vd
 * documentregister) co the lang nghe de thuc hien hanh dong lien quan (gui
 * email bao xu ly xong cho nguoi da nop van ban) ma khong can tasks phu
 * thuoc nguoc lai vao module do.
 */
public record TaskCompletedEvent(Long taskId) {
}
