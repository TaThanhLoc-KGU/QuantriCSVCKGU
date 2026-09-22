package com.ttloc.qtcsvc.identity;

import com.ttloc.qtcsvc.support.ApiDocumentationSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserMemberAdminApiTest extends ApiDocumentationSupport {

    @Test
    void adminCanManageMembers() throws Exception {
        Cookie admin = loginAsAdmin();
        String name = unique("Nhan su");

        String createBody = objectMapper.writeValueAsString(Map.of(
                "name", name, "position", "Chuyen vien", "email", "test@vnkgu.edu.vn", "sortOrder", 1));

        String response = mockMvc.perform(post("/api/admin/members").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andDo(document("member-create"))
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(put("/api/admin/members/" + id).with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("position", "Truong nhom"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.position").value("Truong nhom"))
                .andDo(document("member-update"));

        mockMvc.perform(get("/api/admin/members").cookie(admin))
                .andExpect(status().isOk())
                .andDo(document("member-list"));

        mockMvc.perform(delete("/api/admin/members/" + id).with(csrf()).cookie(admin))
                .andExpect(status().isNoContent())
                .andDo(document("member-delete"));
    }

    @Test
    void adminCanCreateUpdateResetPasswordAndDeleteLocalUser() throws Exception {
        Cookie admin = loginAsAdmin();
        String username = unique("staff");

        String createBody = objectMapper.writeValueAsString(Map.of(
                "username", username, "email", username + "@vnkgu.edu.vn", "fullName", "Nguoi dung test",
                "password", "matkhau123", "role", "STAFF", "authProvider", "LOCAL"));

        String response = mockMvc.perform(post("/api/admin/users").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andDo(document("user-create"))
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(response).get("id").asLong();

        mockMvc.perform(put("/api/admin/users/" + id).with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("role", "EDITOR"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("EDITOR"))
                .andDo(document("user-update"));

        mockMvc.perform(patch("/api/admin/users/" + id + "/password").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("newPassword", "matkhaumoi456"))))
                .andExpect(status().isNoContent())
                .andDo(document("user-reset-password"));

        // Dang nhap bang mat khau moi de xac nhan reset thanh cong
        login(username, "matkhaumoi456");

        mockMvc.perform(delete("/api/admin/users/" + id).with(csrf()).cookie(admin))
                .andExpect(status().isNoContent())
                .andDo(document("user-delete"));
    }

    @Test
    void creatingLocalUserWithoutPasswordFails() throws Exception {
        Cookie admin = loginAsAdmin();
        String username = unique("nopass");
        String body = objectMapper.writeValueAsString(Map.of(
                "username", username, "email", username + "@vnkgu.edu.vn", "fullName", "Khong mat khau",
                "role", "STAFF", "authProvider", "LOCAL"));

        mockMvc.perform(post("/api/admin/users").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void staffCannotManageUsers() throws Exception {
        Cookie admin = loginAsAdmin();
        String username = unique("plainstaff");
        String createBody = objectMapper.writeValueAsString(Map.of(
                "username", username, "email", username + "@vnkgu.edu.vn", "fullName", "Staff thuong",
                "password", "matkhau123", "role", "STAFF", "authProvider", "LOCAL"));
        mockMvc.perform(post("/api/admin/users").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated());

        Cookie staffSession = login(username, "matkhau123");

        mockMvc.perform(get("/api/admin/users").cookie(staffSession))
                .andExpect(status().isForbidden())
                .andDo(document("user-list-forbidden-for-staff"));
    }

}
