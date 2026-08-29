package com.ttloc.qtcsvc.congvanlink;

import java.time.LocalDateTime;

/**
 * Van ban den ma phong duoc giao xu ly (chu tri hoac phoi hop), doc qua API
 * theo don vi (X-Api-Key) cua he thong Cong van - xem
 * congvanlink.internal.CongVanDenApiClient. Chi doc, khong ghi nguoc lai he
 * thong do.
 */
public record CongVanIncomingDocument(
        String id,
        String soVanBan,
        String soDen,
        LocalDateTime ngayDen,
        LocalDateTime ngayBanHanh,
        String trichYeu,
        String coQuanBanHanh,
        String loaiVanBan,
        String nguoiKy,
        String donViXuLyChinh,
        LocalDateTime hanXuLy,
        LocalDateTime ngayHoanThanh,
        String trangThai,
        String trangThaiText,
        boolean coFile
) {
}
