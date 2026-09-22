package com.ttloc.qtcsvc.congvanlink.internal;

import com.ttloc.qtcsvc.congvanlink.CongVanInternalDocument;

import java.time.LocalDateTime;
import java.util.List;

class CongVanNoiBoApiDtos {

    record FileRef(long id, String tenFile, LocalDateTime ngayUpload) {
    }

    record Detail(
            long id, Integer stt, String soHieu, String tieuDe, String noiDung,
            LocalDateTime ngayBanHanh, String nguoiKy, int trangThai, String trangThaiText,
            LocalDateTime ngayTao, List<FileRef> files
    ) {
        CongVanInternalDocument toSummary() {
            return new CongVanInternalDocument(id, stt, soHieu, tieuDe, noiDung, ngayBanHanh, nguoiKy,
                    trangThai, trangThaiText, ngayTao, files == null ? 0 : files.size());
        }
    }

    /**
     * ngayBanHanh dang chuoi "yyyy-MM-dd" - chuyen thang tu input date cua
     * frontend, khong can parse/format lai o be.
     */
    record SaveRequest(String soHieu, String tieuDe, String noiDung, String ngayBanHanh, String nguoiKy, Integer trangThai) {
    }

}
