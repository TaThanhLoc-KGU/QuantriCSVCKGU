package com.ttloc.qtcsvc.content;

/**
 * Loai khoi noi dung trong 1 danh muc kind=PAGE ("trang con"):
 * - RICH_TEXT: van ban tu do (dung lai Tiptap editor nhu Post.content).
 * - POST_LIST: nhung tin moi nhat cua 1 danh muc kind=POST, nhung vao trang.
 * - DATA_TABLE: bang du lieu tuy chinh (cot/nhom/dong tu dinh nghia), moi o
 *   co the la van ban, ngay, lien ket, hoac file tai ve.
 * - STAFF_LIST: danh sach toan bo nhan su dang hoat dong (dung lai module identity).
 */
public enum PageBlockType {
    RICH_TEXT, POST_LIST, DATA_TABLE, STAFF_LIST
}
