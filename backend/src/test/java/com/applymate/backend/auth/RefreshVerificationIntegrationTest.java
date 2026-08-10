package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
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
class RefreshVerificationIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer(
                    "postgres:17-alpine"
            );

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JsonMapper jsonMapper;

    @Test
    void unverifiedUserShouldNotRefreshAuthenticationSession()
            throws Exception {

        AppUser user =
                createUser(
                        "unverified-refresh-"
                                + UUID.randomUUID()
                                + "@example.com",
                        false
                );

        RefreshTokenGrant initialGrant =
                refreshTokenService.issue(
                        user.getId()
                );

        mockMvc.perform(
                        post("/api/v1/auth/refresh")
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        refreshBody(
                                                initialGrant
                                                        .refreshToken()
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

        Integer activeRefreshTokens =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM refresh_tokens
                        WHERE user_id = ?
                          AND revoked_at IS NULL
                        """,
                        Integer.class,
                        user.getId()
                );

        assertEquals(
                0,
                activeRefreshTokens
        );
    }

    @Test
    void verifiedUserShouldContinueToRotateRefreshSession()
            throws Exception {

        AppUser user =
                createUser(
                        "verified-refresh-"
                                + UUID.randomUUID()
                                + "@example.com",
                        true
                );

        RefreshTokenGrant initialGrant =
                refreshTokenService.issue(
                        user.getId()
                );

        MvcResult result =
                mockMvc.perform(
                                post("/api/v1/auth/refresh")
                                        .contentType(
                                                MediaType.APPLICATION_JSON
                                        )
                                        .content(
                                                refreshBody(
                                                        initialGrant
                                                                .refreshToken()
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
                        .andExpect(
                                jsonPath("$.userId")
                                        .value(
                                                user.getId()
                                                        .toString()
                                        )
                        )
                        .andReturn();

        JsonNode response =
                jsonMapper.readTree(
                        result.getResponse()
                                .getContentAsString()
                );

        String rotatedRefreshToken =
                response.get("refreshToken")
                        .asText();

        assertNotEquals(
                initialGrant.refreshToken(),
                rotatedRefreshToken
        );

        Integer activeRefreshTokens =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM refresh_tokens
                        WHERE user_id = ?
                          AND revoked_at IS NULL
                        """,
                        Integer.class,
                        user.getId()
                );

        assertEquals(
                1,
                activeRefreshTokens
        );
    }

    private AppUser createUser(
            String email,
            boolean verified
    ) {
        AppUser user =
                new AppUser(
                        email,
                        "unused-password-hash",
                        "Refresh",
                        "User"
                );

        if (verified) {
            user.markEmailVerified();
        }

        return appUserRepository.saveAndFlush(
                user
        );
    }

    private String refreshBody(
            String refreshToken
    ) {
        return """
                {
                  "refreshToken": "%s"
                }
                """.formatted(
                refreshToken
        );
    }
}