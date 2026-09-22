package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanIncomingDocument;

import java.time.LocalDateTime;
import java.util.List;

class CongVanDenApiDtos {

    record ListResponse(int total, int page, int pageSize, List<CongVanIncomingDocument> items) {
    }

    record XuLyCuaDonVi(String vaiTro, int trangThai, String trangThaiText, LocalDateTime ngayTiepNhan, LocalDateTime ngayHoanThanh, String ghiChu) {
    }

    record FileRef(long id, String tenFile, LocalDateTime ngayUpload, String urlTaiFile) {
    }

    record Detail(
            String id, String soVanBan, String soDen, LocalDateTime ngayDen, LocalDateTime ngayBanHanh,
            String trichYeu, String coQuanBanHanh, String loaiVanBan, String nguoiKy, String ghiChu,
            String donViXuLyChinh, LocalDateTime hanXuLy, LocalDateTime ngayHoanThanh,
            String trangThai, String trangThaiText, XuLyCuaDonVi xuLyCuaDonVi, List<FileRef> files
    ) {
    }

}
