package com.ttloc.qtcsvc.settings;

import com.ttloc.qtcsvc.support.ApiDocumentationSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SettingsApiTest extends ApiDocumentationSupport {

    @Test
    void adminCanReadAndUpdateSettings() throws Exception {
        Cookie admin = loginAsAdmin();

        mockMvc.perform(get("/api/admin/settings").cookie(admin))
                .andExpect(status().isOk())
                .andDo(document("settings-list"));

        String orgName = unique("Truong");
        String updateBody = objectMapper.writeValueAsString(Map.of("org.name", orgName));
        mockMvc.perform(put("/api/admin/settings").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(updateBody))
                .andExpect(status().isOk())
                .andDo(document("settings-update"));

        mockMvc.perform(get("/api/admin/settings").cookie(admin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.key == 'org.name')].value").value(orgName));
    }

    @Test
    void secretKeyNeverLeaksValueOnlyConfiguredFlag() throws Exception {
        Cookie admin = loginAsAdmin();

        String updateBody = objectMapper.writeValueAsString(Map.of("ai.apiKey", "sk-test-secret-value"));
        mockMvc.perform(put("/api/admin/settings").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(updateBody))
                .andExpect(status().isOk());

        String response = mockMvc.perform(get("/api/admin/settings").cookie(admin))
                        .andExpect(status().isOk())
                        .andReturn().getResponse().getContentAsString();

        org.assertj.core.api.Assertions.assertThat(response).doesNotContain("sk-test-secret-value");
    }

    @Test
    void staffCannotAccessSettings() throws Exception {
        Cookie admin = loginAsAdmin();
        String username = unique("settingstaff");
        String body = objectMapper.writeValueAsString(Map.of(
                "username", username, "email", username + "@vnkgu.edu.vn", "fullName", username,
                "password", "matkhau123", "role", "STAFF", "authProvider", "LOCAL"));
        mockMvc.perform(post("/api/admin/users").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        Cookie staff = login(username, "matkhau123");

        mockMvc.perform(get("/api/admin/settings").cookie(staff))
                .andExpect(status().isForbidden())
                .andDo(document("settings-forbidden-for-staff"));
    }

}
