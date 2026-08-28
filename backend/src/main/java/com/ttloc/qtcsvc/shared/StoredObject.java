package com.ttloc.qtcsvc.shared;

/**
 * Ket qua sau khi luu 1 file vao MinIO.
 *
 * @param objectKey     key duy nhat dung de doc/xoa lai file tren MinIO
 * @param originalName  ten file goc nguoi dung upload
 * @param size          kich thuoc (byte)
 */
public record StoredObject(String objectKey, String originalName, long size) {
}
