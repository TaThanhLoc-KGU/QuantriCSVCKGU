package com.ttloc.qtcsvc.identity;

import com.ttloc.qtcsvc.support.ApiDocumentationSupport;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import jakarta.servlet.http.Cookie;

import java.util.Map;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthApiTest extends ApiDocumentationSupport {

    @Test
    void loginSucceedsWithSeededAdmin() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "admin", "password", "admin123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andDo(document("auth-login",
                        requestFields(
                                fieldWithPath("username").description("Ten dang nhap (local account)"),
                                fieldWithPath("password").description("Mat khau")
                        ),
                        responseFields(
                                fieldWithPath("id").description("Id nguoi dung"),
                                fieldWithPath("username").description("Ten dang nhap"),
                                fieldWithPath("fullName").description("Ho ten"),
                                fieldWithPath("email").description("Email"),
                                fieldWithPath("role").description("STAFF | EDITOR | ADMIN")
                        )));
    }

    @Test
    void loginFailsWithWrongPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", "admin", "password", "sai-mat-khau"))))
                .andExpect(status().isUnauthorized())
                .andDo(document("auth-login-failure"));
    }

    @Test
    void meReturnsCurrentUserWhenLoggedIn() throws Exception {
        Cookie session = loginAsAdmin();
        mockMvc.perform(get("/api/auth/me").cookie(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("admin"))
                .andDo(document("auth-me"));
    }

    @Test
    void meReturns401WhenNotLoggedIn() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutInvalidatesSession() throws Exception {
        Cookie session = loginAsAdmin();
        mockMvc.perform(post("/api/auth/logout").with(csrf()).cookie(session))
                .andExpect(status().isOk())
                .andDo(document("auth-logout"));
        mockMvc.perform(get("/api/auth/me").cookie(session))
                .andExpect(status().isUnauthorized());
    }

}
