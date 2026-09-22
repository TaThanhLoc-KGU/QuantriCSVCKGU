package com.ttloc.qtcsvc.congvanlink;

import java.time.LocalDateTime;

/**
 * Van ban DI da duoc van thu gan "dau cong khai" tren he thong Cong van, doc
 * qua API cong khai (khong can dang nhap) cua he thong do - xem
 * congvanlink.internal.CongVanPublicApiClient.
 */
public record CongVanOutgoingDocument(
        String id,
        String soVanBan,
        LocalDateTime ngayVanBan,
        LocalDateTime ngayBanHanh,
        String trichYeu,
        String loaiVanBan,
        String soVanBanThuoc,
        String nguoiKy,
        String donViSoanThao,
        boolean daKySo,
        boolean coFile,
        LocalDateTime ngayCongKhai
) {
}
