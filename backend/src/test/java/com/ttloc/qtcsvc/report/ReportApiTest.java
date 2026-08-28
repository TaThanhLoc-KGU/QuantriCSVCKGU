package com.ttloc.qtcsvc.report;

import com.ttloc.qtcsvc.support.ApiDocumentationSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.util.Map;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ReportApiTest extends ApiDocumentationSupport {

    @Test
    void getCreatesEmptyReportAndPutUpdatesSections() throws Exception {
        Cookie admin = loginAsAdmin();
        String periodId = LocalDate.now().getYear() + "-M" + LocalDate.now().getMonthValue();

        mockMvc.perform(get("/api/admin/reports/" + periodId).cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.periodId").value(periodId))
                .andExpect(jsonPath("$.periodType").value("MONTH"))
                .andDo(document("report-get"));

        String updateBody = objectMapper.writeValueAsString(Map.of(
                "sections", Map.of("muc1", "Dac diem tinh hinh...", "muc2", "Cong tac chi dao...")));
        mockMvc.perform(put("/api/admin/reports/" + periodId).with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sections.muc1").value("Dac diem tinh hinh..."))
                .andDo(document("report-update-sections"));

        mockMvc.perform(get("/api/admin/reports/" + periodId).cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sections.muc2").value("Cong tac chi dao..."));
    }

    @Test
    void exportDocxReturnsWordDocument() throws Exception {
        Cookie admin = loginAsAdmin();
        String periodId = LocalDate.now().getYear() + "-Q1";

        mockMvc.perform(get("/api/admin/reports/" + periodId + "/export/docx").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .andDo(document("report-export-docx"));
    }

}
