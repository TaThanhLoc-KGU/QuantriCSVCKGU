package com.ttloc.qtcsvc.congvanlink;

import java.time.LocalDateTime;

/**
 * Van ban noi bo cua chinh phong (QTCSVC), luu tren he thong Cong van qua
 * API rieng cho don vi (X-Api-Key) - xem
 * congvanlink.internal.CongVanNoiBoApiClient. Doc/ghi duoc (khac voi van ban
 * den/di chi doc), vi day la du lieu cua chinh don vi minh.
 */
public record CongVanInternalDocument(
        long id,
        Integer stt,
        String soHieu,
        String tieuDe,
        String noiDung,
        LocalDateTime ngayBanHanh,
        String nguoiKy,
        int trangThai,
        String trangThaiText,
        LocalDateTime ngayTao,
        Integer soFile
) {
}
