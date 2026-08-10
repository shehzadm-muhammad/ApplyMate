package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
        "security.jwt.issuer=applymate-api-test",
        "security.email-verification.pepper="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
        "app.email.provider=disabled"
})
class RegistrationEmailVerificationIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer(
                    "postgres:17-alpine"
            );

    @Autowired
    private AuthService authService;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void providerFailureShouldLeaveRecoverableUnverifiedAccount() {
        String email =
                "registration-"
                        + UUID.randomUUID()
                        + "@example.com";

        RegisterResponse response =
                authService.register(
                        new RegisterRequest(
                                "Test",
                                "User",
                                email,
                                "ApplyMate123!"
                        )
                );

        assertTrue(
                response.verificationRequired()
        );

        assertFalse(
                response.verificationEmailSent()
        );

        assertNotNull(
                response.verificationExpiresAt()
        );

        assertNotNull(
                response.resendAvailableAt()
        );

        AppUser persistedUser =
                appUserRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow();

        assertFalse(
                persistedUser.isEmailVerified()
        );

        Integer verificationChallengeCount =
            jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*)
                    FROM email_verification_codes
                    WHERE user_id = ?
                    """,
                    Integer.class,
                    persistedUser.getId()
            );

    assertEquals(
            1,
            verificationChallengeCount
    );
    }
}