package com.applymate.backend.application;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobApplicationControllerTest {

    private static final UUID USER_ID = UUID.fromString(
            "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
    );

    private static final UUID APPLICATION_ID = UUID.fromString(
            "f4b85d6c-68b4-4997-bfd9-ab919b56fa50"
    );

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobApplicationService applicationService;

    @Test
    void shouldCreateApplication() throws Exception {
        when(applicationService.create(
                eq(USER_ID),
                any(CreateJobApplicationRequest.class)
        )).thenReturn(testResponse());

        mockMvc.perform(post("/api/v1/applications")
                        .principal(() -> USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "jobUrl": "https://example.com/jobs/java-developer",
                                  "company": "Example Bank",
                                  "jobTitle": "Java Developer",
                                  "location": "Birmingham",
                                  "salary": "\\u00A335,000",
                                  "status": "APPLIED",
                                  "notes": "Applied through company website",
                                  "jobDescription": "Backend Java development",
                                  "requiredSkills": "Java, Spring Boot, PostgreSQL",
                                  "benefits": "Hybrid working",
                                  "recruiter": "Jane Smith",
                                  "applicationDeadline": "2026-08-31"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id")
                        .value(APPLICATION_ID.toString()))
                .andExpect(jsonPath("$.company")
                        .value("Example Bank"))
                .andExpect(jsonPath("$.jobTitle")
                        .value("Java Developer"))
                .andExpect(jsonPath("$.status")
                        .value("APPLIED"))
                .andExpect(jsonPath("$.salary")
                        .value("\u00A335,000"));
    }

    @Test
    void shouldReturnApplicationsForCurrentUser() throws Exception {
        when(applicationService.findAllForUser(USER_ID))
                .thenReturn(List.of(testResponse()));

        mockMvc.perform(get("/api/v1/applications")
                        .principal(() -> USER_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id")
                        .value(APPLICATION_ID.toString()))
                .andExpect(jsonPath("$[0].company")
                        .value("Example Bank"))
                .andExpect(jsonPath("$[0].jobTitle")
                        .value("Java Developer"))
                .andExpect(jsonPath("$[0].status")
                        .value("APPLIED"));
    }

    @Test
    void shouldRejectInvalidApplicationRequest() throws Exception {
        mockMvc.perform(post("/api/v1/applications")
                        .principal(() -> USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "company": "",
                                  "jobTitle": "",
                                  "status": null
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    private JobApplicationResponse testResponse() {
        return new JobApplicationResponse(
                APPLICATION_ID,
                "https://example.com/jobs/java-developer",
                "Example Bank",
                "Java Developer",
                "Birmingham",
                "\u00A335,000",
                ApplicationStatus.APPLIED,
                "Applied through company website",
                "Backend Java development",
                "Java, Spring Boot, PostgreSQL",
                "Hybrid working",
                "Jane Smith",
                LocalDate.of(2026, 8, 31),
                Instant.parse("2026-07-19T13:59:55Z"),
                Instant.parse("2026-07-19T13:59:55Z")
        );
    }
}