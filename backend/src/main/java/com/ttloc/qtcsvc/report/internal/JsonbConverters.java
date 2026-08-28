package com.ttloc.qtcsvc.report.internal;

import com.ttloc.qtcsvc.report.Json;
import org.postgresql.util.PGobject;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;

import java.sql.SQLException;

/**
 * Spring Data JDBC khong tu anh xa Json <-> jsonb, phai khai bao converter
 * rieng (dang ky qua JdbcCustomConversions trong JsonbConfig). Nguon la kieu
 * Json rieng (khong phai String tran) de tranh Spring bac cau nham voi
 * converter Enum->String mac dinh va ap dung cho moi cot enum khac (da gap
 * loi nay thuc te - xem ghi chu trong Json.java).
 */
final class JsonbConverters {

    private JsonbConverters() {
    }

    @ReadingConverter
    static class PgObjectToJsonConverter implements Converter<PGobject, Json> {
        @Override
        public Json convert(PGobject source) {
            return new Json(source.getValue());
        }
    }

    @WritingConverter
    static class JsonToPgObjectConverter implements Converter<Json, PGobject> {
        @Override
        public PGobject convert(Json source) {
            PGobject pgObject = new PGobject();
            pgObject.setType("jsonb");
            try {
                pgObject.setValue(source.value());
            } catch (SQLException e) {
                throw new IllegalStateException("Khong the ghi gia tri jsonb", e);
            }
            return pgObject;
        }
    }

}
