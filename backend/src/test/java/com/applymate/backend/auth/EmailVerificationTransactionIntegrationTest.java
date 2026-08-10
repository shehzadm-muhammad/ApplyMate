package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",
        "security.jwt.issuer=applymate-api-test",
        "security.email-verification.pepper="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE="
})
class EmailVerificationTransactionIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer("postgres:17-alpine");

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void incorrectAttemptShouldRemainCommittedAfterException() {
        String email =
                "verification-"
                        + UUID.randomUUID()
                        + "@example.com";

        AppUser user =
                new AppUser(
                        email,
                        "unused-password-hash",
                        "Verification",
                        "Test"
                );

        AppUser savedUser =
                appUserRepository.saveAndFlush(user);

        IssuedEmailVerificationCode issued =
                emailVerificationService.issueInitialCode(
                        savedUser
                );

        String incorrectCode =
                issued.rawCode().equals("000000")
                        ? "000001"
                        : "000000";

        assertThrows(
                IncorrectVerificationCodeException.class,
                () -> emailVerificationService.verifyEmail(
                        email,
                        incorrectCode
                )
        );

        Integer failedAttempts =
                jdbcTemplate.queryForObject(
                        """
                        SELECT failed_attempts
                        FROM email_verification_codes
                        WHERE user_id = ?
                        """,
                        Integer.class,
                        savedUser.getId()
                );

        assertEquals(
                1,
                failedAttempts
        );
    }
}