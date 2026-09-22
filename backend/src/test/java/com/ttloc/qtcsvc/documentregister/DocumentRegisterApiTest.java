package com.ttloc.qtcsvc.documentregister;

import com.ttloc.qtcsvc.support.ApiDocumentationSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.util.Map;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class DocumentRegisterApiTest extends ApiDocumentationSupport {

    private Long createDocumentType(Cookie admin, String code) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "code", code, "name", "Loai test " + code, "symbolCode", code + "-QTCSVC",
                "direction", "OUTGOING", "resetYearly", true));
        String response = mockMvc.perform(post("/api/admin/document-types").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    void adminCanCreateDocumentTypeButStaffCannot() throws Exception {
        Cookie admin = loginAsAdmin();
        String code = unique("TL").toUpperCase().replace("-", "_");

        Long typeId = createDocumentType(admin, code);

        mockMvc.perform(get("/api/admin/document-types").cookie(admin))
                .andExpect(status().isOk())
                .andDo(document("document-type-list"));

        // STAFF xem duoc danh sach (de hien tab) nhung khong tao duoc loai moi
        String staffUsername = unique("dvstaff");
        String createStaffBody = objectMapper.writeValueAsString(Map.of(
                "username", staffUsername, "email", staffUsername + "@vnkgu.edu.vn", "fullName", "Staff",
                "password", "matkhau123", "role", "STAFF", "authProvider", "LOCAL"));
        mockMvc.perform(post("/api/admin/users").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(createStaffBody))
                .andExpect(status().isCreated());
        Cookie staff = login(staffUsername, "matkhau123");

        mockMvc.perform(get("/api/admin/document-types").cookie(staff))
                .andExpect(status().isOk());

        String body = objectMapper.writeValueAsString(Map.of(
                "code", unique("X"), "name", "x", "symbolCode", "X-QTCSVC", "direction", "OUTGOING"));
        mockMvc.perform(post("/api/admin/document-types").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());

        // ai dang nhap cung xin so duoc (spec 6.1)
        int year = LocalDate.now().getYear();
        String numberBody = objectMapper.writeValueAsString(Map.of(
                "documentTypeId", typeId, "year", year, "numberInt", 1,
                "title", "Trich yeu test", "person", "Nguyen Van A", "issueDate", LocalDate.now().toString()));
        mockMvc.perform(post("/api/admin/document-numbers").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON).content(numberBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numberDisplay").value("01/" + code + "-QTCSVC"))
                .andDo(document("document-number-create"));
    }

    @Test
    void nextNumberAndDuplicateWarningFlow() throws Exception {
        Cookie admin = loginAsAdmin();
        String code = unique("DN").toUpperCase().replace("-", "_");
        Long typeId = createDocumentType(admin, code);
        int year = LocalDate.now().getYear();

        mockMvc.perform(get("/api/admin/document-numbers/next")
                        .param("type", typeId.toString()).param("year", String.valueOf(year))
                        .cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nextNumber").value(1))
                .andDo(document("document-number-next"));

        String body = objectMapper.writeValueAsString(Map.of(
                "documentTypeId", typeId, "year", year, "numberInt", 5,
                "title", "Van ban dau tien", "issueDate", LocalDate.now().toString()));
        mockMvc.perform(post("/api/admin/document-numbers").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/admin/document-numbers/next")
                        .param("type", typeId.toString()).param("year", String.valueOf(year))
                        .cookie(admin))
                .andExpect(jsonPath("$.nextNumber").value(6));

        // Tao trung so 5 ma khong xac nhan -> canh bao 409
        String dupBody = objectMapper.writeValueAsString(Map.of(
                "documentTypeId", typeId, "year", year, "numberInt", 5,
                "title", "Van ban trung so", "issueDate", LocalDate.now().toString()));
        mockMvc.perform(post("/api/admin/document-numbers").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(dupBody))
                .andExpect(status().isConflict())
                .andDo(document("document-number-duplicate-warning"));

        // Xac nhan van luu (confirmDuplicate=true) -> spec 6.3: cho phep luu, chi canh bao
        String confirmBody = objectMapper.writeValueAsString(Map.of(
                "documentTypeId", typeId, "year", year, "numberInt", 5,
                "title", "Van ban trung so - da xac nhan", "issueDate", LocalDate.now().toString(),
                "confirmDuplicate", true));
        mockMvc.perform(post("/api/admin/document-numbers").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(confirmBody))
                .andExpect(status().isCreated())
                .andDo(document("document-number-duplicate-confirmed"));

        // Chi 2 dong thuc su duoc luu: dong dau + dong da confirmDuplicate=true
        // (lan tao trung khong xac nhan bi tu choi 409, khong duoc luu)
        mockMvc.perform(get("/api/admin/document-numbers")
                        .param("type", typeId.toString()).param("year", String.valueOf(year))
                        .cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

}
