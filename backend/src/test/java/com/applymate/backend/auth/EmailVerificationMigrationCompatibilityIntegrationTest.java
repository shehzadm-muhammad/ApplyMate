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
        void shouldRemoveRolloutDefaultAfterEmailVerificationDeployment() {
        Boolean verificationDefaultRemoved =
                jdbcTemplate.queryForObject(
                        """
                        SELECT column_default IS NULL
                        FROM information_schema.columns
                        WHERE table_schema = 'public'
                        AND table_name = 'app_users'
                        AND column_name = 'email_verified_at'
                        """,
                        Boolean.class
                );

        assertTrue(
                Boolean.TRUE.equals(
                        verificationDefaultRemoved
                )
        );

        String directInsertEmail =
                "post-rollout-"
                        + UUID.randomUUID()
                        + "@example.com";

        /*
        * After V8, an insert that omits email_verified_at
        * must no longer be implicitly marked as verified.
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
                directInsertEmail,
                "test-password-hash",
                "Post",
                "Rollout"
        );

        Boolean directInsertVerified =
                jdbcTemplate.queryForObject(
                        """
                        SELECT email_verified_at IS NOT NULL
                        FROM app_users
                        WHERE email = ?
                        """,
                        Boolean.class,
                        directInsertEmail
                );

        assertEquals(
                false,
                Boolean.TRUE.equals(
                        directInsertVerified
                )
        );

        String newEmail =
                "new-registration-"
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
                Boolean.TRUE.equals(
                        newUserVerified
                )
        );

        assertTrue(
                response.verificationRequired()
        );

        assertEquals(
                1,
                challengeCount
        );
        }
}