package com.applymate.backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
class EmailVerificationMigrationCompatibilityIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer(
                    "postgres:17-alpine"
            );

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private AuthService authService;

    @Test
    void shouldSupportOldAndNewRegistrationDuringRollout() {
        String legacyEmail =
                "legacy-rollout-"
                        + UUID.randomUUID()
                        + "@example.com";

        /*
         * Simulate the pre-email-verification backend.
         * It does not know the email_verified_at column,
         * so the column is deliberately omitted.
         */
        jdbcTemplate.update(
                """
                INSERT INTO app_users (
                    email,
                    password_hash,
                    first_name,
                    last_name
                )
                VALUES (?, ?, ?, ?)
                """,
                legacyEmail,
                "legacy-password-hash",
                "Legacy",
                "User"
        );

        Boolean legacyUserVerified =
                jdbcTemplate.queryForObject(
                        """
                        SELECT email_verified_at IS NOT NULL
                        FROM app_users
                        WHERE email = ?
                        """,
                        Boolean.class,
                        legacyEmail
                );

        assertTrue(
                Boolean.TRUE.equals(legacyUserVerified)
        );

        String newEmail =
                "new-rollout-"
                        + UUID.randomUUID()
                        + "@example.com";

        RegisterResponse response =
                authService.register(
                        new RegisterRequest(
                                "New",
                                "User",
                                newEmail,
                                "ApplyMate123!"
                        )
                );

        Boolean newUserVerified =
                jdbcTemplate.queryForObject(
                        """
                        SELECT email_verified_at IS NOT NULL
                        FROM app_users
                        WHERE email = ?
                        """,
                        Boolean.class,
                        newEmail
                );

        Integer challengeCount =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM email_verification_codes
                        WHERE user_id = (
                            SELECT id
                            FROM app_users
                            WHERE email = ?
                        )
                        """,
                        Integer.class,
                        newEmail
                );

        assertEquals(
                false,
                Boolean.TRUE.equals(newUserVerified)
        );

        assertTrue(response.verificationRequired());

        assertEquals(
                1,
                challengeCount
        );
    }
}