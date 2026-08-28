package com.ttloc.qtcsvc.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base cho test API + sinh tai lieu Spring REST Docs. Dung DB rieng
 * (qtcsvc_test, xem application-test.yml) - can tao truoc bang:
 * psql -U postgres -c "CREATE DATABASE qtcsvc_test OWNER qtcsvc;"
 */
@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureRestDocs
@ActiveProfiles("test")
@ExtendWith(RestDocumentationExtension.class)
public abstract class ApiDocumentationSupport {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    /**
     * Tra ve cookie "SESSION" (Spring Session JDBC, khong phai session cua
     * servlet container mac dinh) - gan vao request sau bang .cookie(...),
     * KHONG dung .session(MockHttpSession) vi khong lien quan gi den session
     * thuc su duoc luu trong Postgres.
     */
    protected Cookie loginAsAdmin() throws Exception {
        return login("admin", "admin123");
    }

    protected Cookie login(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("username", username, "password", password))))
                .andExpect(status().isOk())
                .andReturn();
        Cookie session = result.getResponse().getCookie("SESSION");
        if (session == null) {
            throw new IllegalStateException("Dang nhap thanh cong nhung khong thay cookie SESSION trong response");
        }
        return session;
    }

    /**
     * Chuoi ngau nhien ngan de tranh trung slug/code khi chay test nhieu lan
     * tren cung 1 DB (khong rollback giua cac lan chay).
     */
    protected String unique(String prefix) {
        return prefix + "-" + Long.toString(System.nanoTime(), 36);
    }

}
