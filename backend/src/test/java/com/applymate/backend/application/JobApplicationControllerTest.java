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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobApplicationController.class)
@AutoConfigureMockMvc(addFilters = false)
class JobApplicationControllerTest {

        private static final UUID USER_ID = UUID.fromString(
                        "5e80a2a3-e80d-4d3f-916b-d121f73fb309");

        private static final UUID APPLICATION_ID = UUID.fromString(
                        "f4b85d6c-68b4-4997-bfd9-ab919b56fa50");

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private JobApplicationService applicationService;

        @Test
        void shouldFilterApplicationsByStatusAndSearch() throws Exception {
                when(applicationService.findAllForUser(
                                USER_ID,
                                ApplicationStatus.INTERVIEW,
                                "java")).thenReturn(List.of(updatedResponse()));

                mockMvc.perform(get("/api/v1/applications")
                                .principal(() -> USER_ID.toString())
                                .param("status", "INTERVIEW")
                                .param("search", "java"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].id")
                                                .value(APPLICATION_ID.toString()))
                                .andExpect(jsonPath("$[0].jobTitle")
                                                .value("Senior Java Developer"))
                                .andExpect(jsonPath("$[0].status")
                                                .value("INTERVIEW"));
        }

        @Test
        void shouldReturnApplicationSummary() throws Exception {
                ApplicationSummaryResponse summary = new ApplicationSummaryResponse(
                                12,
                                2,
                                4,
                                1,
                                3,
                                1,
                                1);

                when(applicationService.getSummary(USER_ID))
                                .thenReturn(summary);

                mockMvc.perform(get("/api/v1/applications/summary")
                                .principal(() -> USER_ID.toString()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.total").value(12))
                                .andExpect(jsonPath("$.saved").value(2))
                                .andExpect(jsonPath("$.applied").value(4))
                                .andExpect(jsonPath("$.assessment").value(1))
                                .andExpect(jsonPath("$.interview").value(3))
                                .andExpect(jsonPath("$.offer").value(1))
                                .andExpect(jsonPath("$.rejected").value(1));
        }

        @Test
        void shouldRejectUnknownApplicationStatus() throws Exception {
                mockMvc.perform(get("/api/v1/applications")
                                .principal(() -> USER_ID.toString())
                                .param("status", "UNKNOWN"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.message")
                                                .value("Invalid value for parameter 'status'"));
        }

        @Test
        void shouldCreateApplication() throws Exception {
                when(applicationService.create(
                                eq(USER_ID),
                                any(CreateJobApplicationRequest.class))).thenReturn(testResponse());

                mockMvc.perform(post("/api/v1/applications")
                                .principal(() -> USER_ID.toString())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "jobUrl": "https://example.com/jobs/java-developer",
                                                  "company": "Example Bank",
                                                  "jobTitle": "Java Developer",
                                                  "location": "Birmingham",
                                                  "salary": "GBP 35,000",
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
                                                .value("APPLIED"));
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
                                .andExpect(jsonPath("$[0].status")
                                                .value("APPLIED"));
        }

        @Test
        void shouldReturnOneOwnedApplication() throws Exception {
                when(applicationService.findById(
                                USER_ID,
                                APPLICATION_ID)).thenReturn(testResponse());

                mockMvc.perform(get(
                                "/api/v1/applications/{applicationId}",
                                APPLICATION_ID)
                                .principal(() -> USER_ID.toString()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id")
                                                .value(APPLICATION_ID.toString()))
                                .andExpect(jsonPath("$.company")
                                                .value("Example Bank"))
                                .andExpect(jsonPath("$.jobTitle")
                                                .value("Java Developer"));
        }

        @Test
        void shouldUpdateOwnedApplication() throws Exception {
                when(applicationService.update(
                                eq(USER_ID),
                                eq(APPLICATION_ID),
                                any(UpdateJobApplicationRequest.class))).thenReturn(updatedResponse());

                mockMvc.perform(put(
                                "/api/v1/applications/{applicationId}",
                                APPLICATION_ID)
                                .principal(() -> USER_ID.toString())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                                {
                                                  "jobUrl": "https://example.com/jobs/senior-java-developer",
                                                  "company": "Updated Bank",
                                                  "jobTitle": "Senior Java Developer",
                                                  "location": "Birmingham",
                                                  "salary": "GBP 40,000",
                                                  "status": "INTERVIEW",
                                                  "notes": "Interview booked for Monday",
                                                  "jobDescription": "Backend development",
                                                  "requiredSkills": "Java, Spring Boot, PostgreSQL",
                                                  "benefits": "Hybrid working",
                                                  "recruiter": "Jane Smith",
                                                  "applicationDeadline": "2026-09-15"
                                                }
                                                """))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id")
                                                .value(APPLICATION_ID.toString()))
                                .andExpect(jsonPath("$.company")
                                                .value("Updated Bank"))
                                .andExpect(jsonPath("$.jobTitle")
                                                .value("Senior Java Developer"))
                                .andExpect(jsonPath("$.status")
                                                .value("INTERVIEW"))
                                .andExpect(jsonPath("$.salary")
                                                .value("GBP 40,000"));
        }

        @Test
        void shouldDeleteOwnedApplication() throws Exception {
                mockMvc.perform(delete(
                                "/api/v1/applications/{applicationId}",
                                APPLICATION_ID)
                                .principal(() -> USER_ID.toString()))
                                .andExpect(status().isNoContent());

                verify(applicationService).delete(
                                USER_ID,
                                APPLICATION_ID);
        }

        @Test
        void shouldReturnNotFoundForUnavailableApplication()
                        throws Exception {

                when(applicationService.findById(
                                USER_ID,
                                APPLICATION_ID)).thenThrow(new JobApplicationNotFoundException());

                mockMvc.perform(get(
                                "/api/v1/applications/{applicationId}",
                                APPLICATION_ID)
                                .principal(() -> USER_ID.toString()))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.status").value(404))
                                .andExpect(jsonPath("$.error").value("Not Found"))
                                .andExpect(jsonPath("$.message")
                                                .value("Job application was not found"));
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
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.error").value("Bad Request"))
                                .andExpect(jsonPath("$.message")
                                                .value("Request validation failed"))
                                .andExpect(jsonPath("$.path")
                                                .value("/api/v1/applications"))
                                .andExpect(jsonPath("$.fieldErrors.company")
                                                .value("Company is required"))
                                .andExpect(jsonPath("$.fieldErrors.jobTitle")
                                                .value("Job title is required"))
                                .andExpect(jsonPath("$.fieldErrors.status")
                                                .value("Status is required"));
        }

        @Test
        void shouldRejectInvalidUrlAndOversizedRecruiterOnCreate()
                        throws Exception {

                String oversizedRecruiter = "x".repeat(201);

                String requestBody = """
                                {
                                  "jobUrl": "not-a-real-url",
                                  "company": "Example Bank",
                                  "jobTitle": "Java Developer",
                                  "status": "APPLIED",
                                  "recruiter": "%s"
                                }
                                """.formatted(oversizedRecruiter);

                mockMvc.perform(post("/api/v1/applications")
                                .principal(() -> USER_ID.toString())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.message")
                                                .value("Request validation failed"))
                                .andExpect(jsonPath("$.fieldErrors.jobUrl")
                                                .value(
                                                                "Job URL must start with http:// or https://"))
                                .andExpect(jsonPath("$.fieldErrors.recruiter")
                                                .value(
                                                                "Recruiter must not exceed 200 characters"));
        }

        @Test
        void shouldRejectInvalidUrlAndOversizedRecruiterOnUpdate()
                        throws Exception {

                String oversizedRecruiter = "x".repeat(201);

                String requestBody = """
                                {
                                  "jobUrl": "still-not-a-real-url",
                                  "company": "Example Bank",
                                  "jobTitle": "Senior Java Developer",
                                  "status": "INTERVIEW",
                                  "recruiter": "%s"
                                }
                                """.formatted(oversizedRecruiter);

                mockMvc.perform(put(
                                "/api/v1/applications/{applicationId}",
                                APPLICATION_ID)
                                .principal(() -> USER_ID.toString())
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.status").value(400))
                                .andExpect(jsonPath("$.message")
                                                .value("Request validation failed"))
                                .andExpect(jsonPath("$.fieldErrors.jobUrl")
                                                .value(
                                                                "Job URL must start with http:// or https://"))
                                .andExpect(jsonPath("$.fieldErrors.recruiter")
                                                .value(
                                                                "Recruiter must not exceed 200 characters"));
        }

        private JobApplicationResponse testResponse() {
                return new JobApplicationResponse(
                                APPLICATION_ID,
                                "https://example.com/jobs/java-developer",
                                "Example Bank",
                                "Java Developer",
                                "Birmingham",
                                "GBP 35,000",
                                ApplicationStatus.APPLIED,
                                "Applied through company website",
                                "Backend Java development",
                                "Java, Spring Boot, PostgreSQL",
                                "Hybrid working",
                                "Jane Smith",
                                LocalDate.of(2026, 8, 31),
                                Instant.parse("2026-07-19T13:59:55Z"),
                                Instant.parse("2026-07-19T13:59:55Z"));
        }

        private JobApplicationResponse updatedResponse() {
                return new JobApplicationResponse(
                                APPLICATION_ID,
                                "https://example.com/jobs/senior-java-developer",
                                "Updated Bank",
                                "Senior Java Developer",
                                "Birmingham",
                                "GBP 40,000",
                                ApplicationStatus.INTERVIEW,
                                "Interview booked for Monday",
                                "Backend development",
                                "Java, Spring Boot, PostgreSQL",
                                "Hybrid working",
                                "Jane Smith",
                                LocalDate.of(2026, 9, 15),
                                Instant.parse("2026-07-19T13:59:55Z"),
                                Instant.parse("2026-07-23T11:20:00Z"));
        }
}