package com.applymate.backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
        "security.jwt.issuer=applymate-api-test",
        "security.email-verification.pepper="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
        "app.email.provider=disabled"
})
@AutoConfigureMockMvc
class UnverifiedLoginIntegrationTest {

    private static final String PASSWORD =
            "ApplyMate123!";

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer(
                    "postgres:17-alpine"
            );

    @Autowired
    private MockMvc mockMvc;

    @Test
    void unverifiedUserShouldNotReceiveAuthenticationTokens()
            throws Exception {

        String email =
                "unverified-"
                        + UUID.randomUUID()
                        + "@example.com";

        mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "firstName": "Pending",
                                          "lastName": "User",
                                          "email": "%s",
                                          "password": "%s"
                                        }
                                        """.formatted(
                                                email,
                                                PASSWORD
                                        )
                                )
                )
                .andExpect(status().isCreated())
                .andExpect(
                        jsonPath(
                                "$.verificationRequired"
                        ).value(true)
                );

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "email": "%s",
                                          "password": "%s"
                                        }
                                        """.formatted(
                                                email,
                                                PASSWORD
                                        )
                                )
                )
                .andExpect(status().isForbidden())
                .andExpect(
                        jsonPath("$.code")
                                .value(
                                        "EMAIL_VERIFICATION_REQUIRED"
                                )
                )
                .andExpect(
                        jsonPath("$.accessToken")
                                .doesNotExist()
                )
                .andExpect(
                        jsonPath("$.refreshToken")
                                .doesNotExist()
                );
    }
}