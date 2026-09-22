package com.ttloc.qtcsvc.content;

import com.ttloc.qtcsvc.support.ApiDocumentationSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Map;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ContentApiTest extends ApiDocumentationSupport {

    private Long createCategory(Cookie admin, String name) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of("name", name, "kind", "POST", "sortOrder", 1));
        String response = mockMvc.perform(post("/api/admin/categories").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private Cookie createStaffUser(Cookie admin, String username) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "username", username, "email", username + "@vnkgu.edu.vn", "fullName", username,
                "password", "matkhau123", "role", "STAFF", "authProvider", "LOCAL"));
        mockMvc.perform(post("/api/admin/users").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        return login(username, "matkhau123");
    }

    @Test
    void adminCanManageCategoryTree() throws Exception {
        Cookie admin = loginAsAdmin();
        String name = unique("Danh muc");
        Long parentId = createCategory(admin, name);

        String childBody = objectMapper.writeValueAsString(
                Map.of("name", unique("Danh muc con"), "kind", "POST", "parentId", parentId));
        mockMvc.perform(post("/api/admin/categories").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(childBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.parentId").value(parentId))
                .andDo(document("category-create"));

        mockMvc.perform(get("/api/admin/categories").param("kind", "POST").cookie(admin))
                .andExpect(status().isOk())
                .andDo(document("category-list"));
    }

    @Test
    void staffCannotManageCategories() throws Exception {
        Cookie admin = loginAsAdmin();
        Cookie staff = createStaffUser(admin, unique("staffcat"));

        String body = objectMapper.writeValueAsString(Map.of("name", "x", "kind", "POST"));
        mockMvc.perform(post("/api/admin/categories").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanCreatePublishAndPublicCanReadPost() throws Exception {
        Cookie admin = loginAsAdmin();
        Long categoryId = createCategory(admin, unique("Tin tuc"));

        String createBody = objectMapper.writeValueAsString(Map.of(
                "title", unique("Bai viet"), "summary", "Tom tat", "content", "<p>Noi dung</p>",
                "categoryId", categoryId, "publish", true));

        String response = mockMvc.perform(post("/api/admin/posts").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PUBLISHED"))
                .andDo(document("post-create"))
                .andReturn().getResponse().getContentAsString();

        String slug = objectMapper.readTree(response).get("slug").asText();

        var firstView = mockMvc.perform(get("/api/public/posts/{slug}", slug))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.viewCount").value(1))
                .andDo(document("public-post-detail"))
                .andReturn();
        Cookie viewerSession = firstView.getResponse().getCookie("SESSION");

        // Goi lai lan 2 CUNG 1 phien (gan lai cookie SESSION) -> khong tang view lan nua
        mockMvc.perform(get("/api/public/posts/{slug}", slug).cookie(viewerSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.viewCount").value(1));

        mockMvc.perform(get("/api/public/posts").param("category", categoryId.toString()))
                .andExpect(status().isOk())
                .andDo(document("public-post-list"));
    }

    @Test
    void staffCanOnlyEditOwnPost() throws Exception {
        Cookie admin = loginAsAdmin();
        Long categoryId = createCategory(admin, unique("Danh muc staff"));
        Cookie staff1 = createStaffUser(admin, unique("staff1"));
        Cookie staff2 = createStaffUser(admin, unique("staff2"));

        String createBody = objectMapper.writeValueAsString(Map.of(
                "title", unique("Bai cua staff1"), "categoryId", categoryId, "publish", false));
        String response = mockMvc.perform(post("/api/admin/posts").with(csrf()).cookie(staff1)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long postId = objectMapper.readTree(response).get("id").asLong();

        String updateBody = objectMapper.writeValueAsString(Map.of("title", "Bi sua boi nguoi khac"));
        mockMvc.perform(put("/api/admin/posts/" + postId).with(csrf()).cookie(staff2)
                        .contentType(MediaType.APPLICATION_JSON).content(updateBody))
                .andExpect(status().isForbidden())
                .andDo(document("post-update-forbidden"));

        mockMvc.perform(delete("/api/admin/posts/" + postId).with(csrf()).cookie(staff1))
                .andExpect(status().isNoContent());
    }

}
