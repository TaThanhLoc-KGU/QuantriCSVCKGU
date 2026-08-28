package com.ttloc.qtcsvc.tasks;

import com.fasterxml.jackson.databind.JsonNode;
import com.ttloc.qtcsvc.support.ApiDocumentationSupport;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TasksApiTest extends ApiDocumentationSupport {

    private Cookie createStaff(Cookie admin, String username) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "username", username, "email", username + "@vnkgu.edu.vn", "fullName", username,
                "password", "matkhau123", "role", "STAFF", "authProvider", "LOCAL"));
        mockMvc.perform(post("/api/admin/users").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        return login(username, "matkhau123");
    }

    private JsonNode findStepByTitle(JsonNode task, String title) {
        for (JsonNode step : task.get("steps")) {
            if (step.get("title").asText().equals(title)) {
                return step;
            }
        }
        throw new IllegalStateException("Khong tim thay buoc: " + title);
    }

    @Test
    void staffCanManageOwnPersonalTaskAndProgressAutoComputes() throws Exception {
        Cookie admin = loginAsAdmin();
        Cookie staff = createStaff(admin, unique("taskstaff"));
        int year = LocalDate.now().getYear();

        String createBody = objectMapper.writeValueAsString(Map.of(
                "scope", "PERSONAL", "year", year, "title", unique("Nhiem vu ca nhan")));
        String taskResponse = mockMvc.perform(post("/api/admin/tasks").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CHUA_BAT_DAU"))
                .andExpect(jsonPath("$.progressPercent").value(0))
                .andDo(document("task-create"))
                .andReturn().getResponse().getContentAsString();
        long taskId = objectMapper.readTree(taskResponse).get("id").asLong();

        mockMvc.perform(post("/api/admin/tasks/" + taskId + "/steps").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Buoc 1"))))
                .andExpect(status().isCreated())
                .andDo(document("task-step-create"));

        String afterStep2 = mockMvc.perform(post("/api/admin/tasks/" + taskId + "/steps").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("title", "Buoc 2"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.progressPercent").value(0))
                .andReturn().getResponse().getContentAsString();

        JsonNode taskNode = objectMapper.readTree(afterStep2);
        long step1Id = findStepByTitle(taskNode, "Buoc 1").get("id").asLong();
        long step2Id = findStepByTitle(taskNode, "Buoc 2").get("id").asLong();

        mockMvc.perform(patch("/api/admin/tasks/" + taskId + "/steps/" + step1Id + "/status")
                        .with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "HOAN_THANH"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progressPercent").value(50))
                .andExpect(jsonPath("$.status").value("DANG_LAM"))
                .andDo(document("task-step-status-update"));

        mockMvc.perform(patch("/api/admin/tasks/" + taskId + "/steps/" + step2Id + "/status")
                        .with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("status", "HOAN_THANH"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progressPercent").value(100))
                .andExpect(jsonPath("$.status").value("HOAN_THANH"));

        mockMvc.perform(patch("/api/admin/tasks/" + taskId + "/steps/reorder").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("orderedStepIds", List.of(step2Id, step1Id)))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.steps[0].id").value(step2Id))
                .andDo(document("task-step-reorder"));
    }

    @Test
    void staffCannotCreateDeptTaskButAdminCan() throws Exception {
        Cookie admin = loginAsAdmin();
        Cookie staff = createStaff(admin, unique("deptstaff"));
        int year = LocalDate.now().getYear();

        String body = objectMapper.writeValueAsString(Map.of(
                "scope", "DEPT", "year", year, "title", unique("Nhiem vu chung phong")));

        mockMvc.perform(post("/api/admin/tasks").with(csrf()).cookie(staff)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/admin/tasks").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void dashboardReturnsKpiAndMemberTable() throws Exception {
        Cookie admin = loginAsAdmin();
        int year = LocalDate.now().getYear();
        String body = objectMapper.writeValueAsString(Map.of(
                "scope", "DEPT", "year", year, "title", unique("Nhiem vu dashboard")));
        mockMvc.perform(post("/api/admin/tasks").with(csrf()).cookie(admin)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/admin/dashboard/kpi").param("year", String.valueOf(year)).cookie(admin))
                .andExpect(status().isOk())
                .andDo(document("dashboard-kpi"));

        mockMvc.perform(get("/api/admin/dashboard/members").param("year", String.valueOf(year)).cookie(admin))
                .andExpect(status().isOk())
                .andDo(document("dashboard-members"));
    }

}
