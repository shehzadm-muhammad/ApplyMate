package com.applymate.backend.application;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
        "security.jwt.issuer=applymate-api-test"
})
@AutoConfigureMockMvc
class JobApplicationUserIsolationIntegrationTest {

    private static final String PASSWORD = "ApplyMate123!";

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void shouldKeepApplicationsIsolatedBetweenUsers()
            throws Exception {

        String ownerEmail =
                "owner-" + UUID.randomUUID() + "@example.com";

        String otherUserEmail =
                "other-" + UUID.randomUUID() + "@example.com";

        registerUser(
                ownerEmail,
                "Application",
                "Owner"
        );

        registerUser(
                otherUserEmail,
                "Other",
                "User"
        );

        String ownerToken = login(ownerEmail);
        String otherUserToken = login(otherUserEmail);

        String applicationId =
                createApplication(ownerToken);

        // The owner can see their application.
        mockMvc.perform(get("/api/v1/applications")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(ownerToken)
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id")
                        .value(applicationId))
                .andExpect(jsonPath("$[0].company")
                        .value("Example Bank"));

        // The other user's list remains empty.
        mockMvc.perform(get("/api/v1/applications")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(otherUserToken)
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // Summary counts are also isolated.
        mockMvc.perform(get(
                        "/api/v1/applications/summary"
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(ownerToken)
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.applied").value(1));

        mockMvc.perform(get(
                        "/api/v1/applications/summary"
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(otherUserToken)
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(0));

        // The other user cannot read the owner's application.
        mockMvc.perform(get(
                        "/api/v1/applications/{applicationId}",
                        applicationId
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(otherUserToken)
                        ))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message")
                        .value("Job application was not found"));

        // The other user cannot edit the owner's application.
        mockMvc.perform(put(
                        "/api/v1/applications/{applicationId}",
                        applicationId
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(otherUserToken)
                        )
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateRequestBody()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message")
                        .value("Job application was not found"));

        // The other user cannot delete the owner's application.
        mockMvc.perform(delete(
                        "/api/v1/applications/{applicationId}",
                        applicationId
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(otherUserToken)
                        ))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message")
                        .value("Job application was not found"));

        // The application remains unchanged and accessible to its owner.
        mockMvc.perform(get(
                        "/api/v1/applications/{applicationId}",
                        applicationId
                )
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                bearer(ownerToken)
                        ))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.company")
                        .value("Example Bank"))
                .andExpect(jsonPath("$.jobTitle")
                        .value("Java Developer"))
                .andExpect(jsonPath("$.status")
                        .value("APPLIED"));
    }

    private void registerUser(
        String email,
        String firstName,
        String lastName
) throws Exception {

    String requestBody = """
            {
              "firstName": "%s",
              "lastName": "%s",
              "email": "%s",
              "password": "%s"
            }
            """.formatted(
            firstName,
            lastName,
            email,
            PASSWORD
    );

    mockMvc.perform(post("/api/v1/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(requestBody))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value(email));

    AppUser user =
            appUserRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow();

    user.markEmailVerified();

    appUserRepository.saveAndFlush(user);
}

    private String login(String email) throws Exception {
        String requestBody = """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, PASSWORD);

        MvcResult result =
                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(requestBody))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.accessToken")
                                .isNotEmpty())
                        .andReturn();

        JsonNode responseBody = jsonMapper.readTree(
                result.getResponse().getContentAsString()
        );

        return responseBody
                .get("accessToken")
                .asText();
    }

    private String createApplication(String token)
            throws Exception {

        MvcResult result =
                mockMvc.perform(post("/api/v1/applications")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        bearer(token)
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(createRequestBody()))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.company")
                                .value("Example Bank"))
                        .andExpect(jsonPath("$.status")
                                .value("APPLIED"))
                        .andReturn();

        JsonNode responseBody = jsonMapper.readTree(
                result.getResponse().getContentAsString()
        );

        return responseBody.get("id").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String createRequestBody() {
        return """
                {
                  "jobUrl": "https://example.com/jobs/java-developer",
                  "company": "Example Bank",
                  "jobTitle": "Java Developer",
                  "location": "Birmingham",
                  "salary": "GBP 35,000",
                  "status": "APPLIED",
                  "notes": "Submitted through the company website",
                  "jobDescription": "Backend Java development",
                  "requiredSkills": "Java, Spring Boot, PostgreSQL",
                  "benefits": "Hybrid working",
                  "recruiter": "Jane Smith",
                  "applicationDeadline": "2026-08-31"
                }
                """;
    }

    private String updateRequestBody() {
        return """
                {
                  "jobUrl": "https://example.com/jobs/java-developer",
                  "company": "Changed By Other User",
                  "jobTitle": "Tampered Application",
                  "location": "Manchester",
                  "salary": "GBP 50,000",
                  "status": "OFFER",
                  "notes": "This change must not be saved",
                  "jobDescription": "Invalid ownership update",
                  "requiredSkills": "Java",
                  "benefits": "None",
                  "recruiter": "Other User",
                  "applicationDeadline": "2026-09-30"
                }
                """;
    }
}