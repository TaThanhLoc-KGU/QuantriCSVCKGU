package com.ttloc.qtcsvc.congvanlink.internal;

import com.microsoft.sqlserver.jdbc.SQLServerDataSource;
import com.ttloc.qtcsvc.congvanlink.CongVanIncomingDocument;
import com.ttloc.qtcsvc.shared.ExternalServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

/**
 * Doc rieng (read-only) tu CSDL SQL Server cua he thong Cong van
 * (congvan.vnkgu.edu.vn), hoan toan tach biet Postgres chinh cua QTCSVC.
 * COI Y: khong khai bao DataSource nhu 1 Spring bean - se gay xung dot voi
 * DataSource Postgres duoc Spring Boot tu dong cau hinh (Flyway, Spring Data
 * JDBC, Session-JDBC... deu mong doi CHI 1 DataSource khong ro rang trong
 * context). Thay vao do tu tao 1 DataSource "thu cong", chi dung noi bo o
 * day qua 1 JdbcTemplate rieng.
 */
@Repository
class CongVanRepository {

    private static final Logger log = LoggerFactory.getLogger(CongVanRepository.class);

    private static final String QUERY = """
            SELECT cvd.MSCV, cvd.SoCV, cvd.TrichYeu, cvd.NgayDen, cvd.NguoiKy, cq.TenCQ,
                   cvd.NgayBanHanh, cvd.NgayYCHT, cvd.NgayHT,
                   CASE WHEN EXISTS(SELECT 1 FROM CVDenFile f WHERE f.MSCV = cvd.MSCV) THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END AS CoFile
            FROM CongVanDen cvd
            LEFT JOIN CoQuan cq ON cvd.MaCQ = cq.MaCQ
            WHERE (cvd.MaDVXL = ? OR (',' + ISNULL(cvd.BoPhanPhoiHop, '') + ',') LIKE '%,' + CAST(? AS varchar) + ',%')
              AND YEAR(cvd.NgayDen) = ?
            ORDER BY cvd.NgayDen DESC, cvd.STT DESC
            """;

    private final JdbcTemplate jdbc;
    private final int maDv;

    CongVanRepository(@Value("${app.congvan.jdbc-url}") String jdbcUrl,
                       @Value("${app.congvan.ma-dv}") int maDv) {
        SQLServerDataSource dataSource = new SQLServerDataSource();
        dataSource.setURL(jdbcUrl);
        this.jdbc = new JdbcTemplate(dataSource);
        this.maDv = maDv;
    }

    List<CongVanIncomingDocument> findIncoming(int year) {
        try {
            return jdbc.query(QUERY, (rs, rowNum) -> new CongVanIncomingDocument(
                    rs.getString("MSCV"),
                    rs.getString("SoCV"),
                    rs.getString("TrichYeu"),
                    toLocalDate(rs.getDate("NgayDen")),
                    rs.getString("NguoiKy"),
                    rs.getString("TenCQ"),
                    toLocalDate(rs.getDate("NgayBanHanh")),
                    toLocalDate(rs.getDate("NgayYCHT")),
                    toLocalDate(rs.getDate("NgayHT")),
                    rs.getBoolean("CoFile")
            ), maDv, maDv, year);
        } catch (Exception e) {
            log.error("Khong the doc du lieu tu he thong Cong van (kiem tra TCP/IP SQL Server, jdbc-url)", e);
            throw new ExternalServiceException(
                    "Không thể kết nối hệ thống Công văn. Vui lòng kiểm tra kết nối mạng/SQL Server và thử lại.", e);
        }
    }

    private LocalDate toLocalDate(Date date) {
        return date == null ? null : date.toLocalDate();
    }

}
