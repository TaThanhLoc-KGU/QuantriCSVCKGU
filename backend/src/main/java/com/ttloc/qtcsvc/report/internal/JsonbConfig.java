package com.ttloc.qtcsvc.report.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jdbc.core.convert.JdbcCustomConversions;

import java.util.List;

@Configuration
class JsonbConfig {

    /**
     * JdbcCustomConversions gop them converter nay VAO CUNG bo converter mac
     * dinh cua Spring Data JDBC (JSR-310, v.v.) - khong thay the, nen an toan.
     */
    @Bean
    JdbcCustomConversions jdbcCustomConversions() {
        return new JdbcCustomConversions(List.of(
                new JsonbConverters.PgObjectToJsonConverter(),
                new JsonbConverters.JsonToPgObjectConverter()
        ));
    }

    /**
     * Spring Boot 4.1.1-SNAPSHOT (dang chuyen sang Jackson 3 - tools.jackson.*)
     * KHONG tu tao san bean com.fasterxml.jackson.databind.ObjectMapper (Jackson
     * 2 co dien) nhu cac ban Boot cu - tang MVC van tu hoat dong on (dung
     * converter noi bo), nhung code tu @Autowired ObjectMapper (ReportService,
     * ReportAiService) thi can bean nay ro rang.
     */
    @Bean
    ObjectMapper objectMapper() {
        return new ObjectMapper();
    }

}
