package com.applymate.backend.auth;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class EmailVerificationFlowIntegrationTest {

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

    @Autowired
    private JsonMapper jsonMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private VerificationEmailSender verificationEmailSender;

    @Test
    void shouldRequireVerificationThenAllowNormalAuthenticatedAccess()
            throws Exception {

        String email =
                "flow-"
                        + UUID.randomUUID()
                        + "@example.com";

        register(email);

        ArgumentCaptor<VerificationEmailMessage> emailCaptor =
                ArgumentCaptor.forClass(
                        VerificationEmailMessage.class
                );

        verify(verificationEmailSender)
                .sendVerificationCode(
                        emailCaptor.capture()
                );

        String verificationCode =
                emailCaptor.getValue().rawCode();

        mockMvc.perform(
                        post("/api/v1/auth/login")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        loginBody(
                                                email
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

        mockMvc.perform(
                        post("/api/v1/auth/verify-email")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        verificationBody(
                                                email,
                                                verificationCode
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.verified")
                                .value(true)
                );

        JsonNode loginResponse =
                loginSuccessfully(email);

        String accessToken =
                loginResponse
                        .get("accessToken")
                        .asText();

        mockMvc.perform(
                        get("/api/v1/users/me")
                                .header(
                                        HttpHeaders.AUTHORIZATION,
                                        "Bearer " + accessToken
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.email")
                                .value(email)
                );
    }

    @Test
    void resendShouldInvalidateOldCodeAndNewCodeShouldVerify()
            throws Exception {

        String email =
                "resend-flow-"
                        + UUID.randomUUID()
                        + "@example.com";

        register(email);

        ArgumentCaptor<VerificationEmailMessage> emailCaptor =
                ArgumentCaptor.forClass(
                        VerificationEmailMessage.class
                );

        verify(
                verificationEmailSender,
                times(1)
        ).sendVerificationCode(
                emailCaptor.capture()
        );

        String oldCode =
                emailCaptor
                        .getValue()
                        .rawCode();

        /*
         * Move the persisted issuance timestamp outside the
         * 60-second resend cooldown. This avoids sleeping in
         * the test and keeps production timing unchanged.
         */
        jdbcTemplate.update(
                """
                UPDATE email_verification_codes
                SET last_issued_at =
                    CURRENT_TIMESTAMP - INTERVAL '61 seconds'
                WHERE user_id = (
                    SELECT id
                    FROM app_users
                    WHERE LOWER(email) = LOWER(?)
                )
                """,
                email
        );

        mockMvc.perform(
                        post(
                                "/api/v1/auth/resend-verification"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "email": "%s"
                                        }
                                        """.formatted(email)
                                )
                )
                .andExpect(status().isAccepted())
                .andExpect(
                        jsonPath(
                                "$.verificationExpiresAt"
                        ).isNotEmpty()
                )
                .andExpect(
                        jsonPath(
                                "$.resendAvailableAt"
                        ).isNotEmpty()
                );

        ArgumentCaptor<VerificationEmailMessage> resendCaptor =
        ArgumentCaptor.forClass(
                VerificationEmailMessage.class
        );

verify(
        verificationEmailSender,
        times(2)
).sendVerificationCode(
        resendCaptor.capture()
);

String newCode =
        resendCaptor
                .getAllValues()
                .get(1)
                .rawCode();

        mockMvc.perform(
                        post("/api/v1/auth/verify-email")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        verificationBody(
                                                email,
                                                oldCode
                                        )
                                )
                )
                .andExpect(status().isBadRequest())
                .andExpect(
                        jsonPath("$.code")
                                .value(
                                        "VERIFICATION_CODE_INCORRECT"
                                )
                );

        mockMvc.perform(
                        post("/api/v1/auth/verify-email")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        verificationBody(
                                                email,
                                                newCode
                                        )
                                )
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.verified")
                                .value(true)
                );

        loginSuccessfully(email);
    }

    private void register(String email)
            throws Exception {

        mockMvc.perform(
                        post("/api/v1/auth/register")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "firstName": "Verification",
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
                )
                .andExpect(
                        jsonPath(
                                "$.verificationEmailSent"
                        ).value(true)
                );
    }

    private JsonNode loginSuccessfully(
            String email
    ) throws Exception {

        String response =
                mockMvc.perform(
                                post("/api/v1/auth/login")
                                        .contentType(
                                                MediaType.APPLICATION_JSON
                                        )
                                        .content(
                                                loginBody(
                                                        email
                                                )
                                        )
                        )
                        .andExpect(status().isOk())
                        .andExpect(
                                jsonPath("$.accessToken")
                                        .isNotEmpty()
                        )
                        .andExpect(
                                jsonPath("$.refreshToken")
                                        .isNotEmpty()
                        )
                        .andReturn()
                        .getResponse()
                        .getContentAsString();

        return jsonMapper.readTree(response);
    }

    private String loginBody(String email) {
        return """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(
                email,
                PASSWORD
        );
    }

    private String verificationBody(
            String email,
            String code
    ) {
        return """
                {
                  "email": "%s",
                  "code": "%s"
                }
                """.formatted(
                email,
                code
        );
    }
}