package com.ttloc.qtcsvc.congvanlink;

import java.time.LocalDate;

/**
 * Van ban den tu he thong Cong van (congvan.vnkgu.edu.vn) duoc giao/phoi hop
 * cho phong xu ly - doc rieng (read-only), khong ghi nguoc lai he thong do.
 */
public record CongVanIncomingDocument(
        String mscv,
        String soCV,
        String trichYeu,
        LocalDate ngayDen,
        String nguoiKy,
        String tenCoQuan,
        LocalDate ngayBanHanh,
        LocalDate hanXuLy,
        LocalDate ngayHoanThanh,
        boolean coFile
) {
}
