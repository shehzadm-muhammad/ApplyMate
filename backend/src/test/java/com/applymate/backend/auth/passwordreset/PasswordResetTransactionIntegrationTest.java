package com.applymate.backend.auth.passwordreset;

import com.applymate.backend.auth.AuthService;
import com.applymate.backend.auth.EmailDeliveryException;
import com.applymate.backend.auth.EmailVerificationRequiredException;
import com.applymate.backend.auth.InvalidCredentialsException;
import com.applymate.backend.auth.InvalidRefreshTokenException;
import com.applymate.backend.auth.LoginRequest;
import com.applymate.backend.auth.LoginResponse;
import com.applymate.backend.auth.RefreshTokenRequest;
import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",

        "security.jwt.issuer=applymate-api-test",

        "security.email-verification.pepper="
                + "MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=",

        "security.password-reset.pepper="
                + "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",

        "security.password-reset.minimum-response-duration=PT0S",

        "app.email.provider=disabled"
})
class PasswordResetTransactionIntegrationTest {

    private static final String OLD_PASSWORD =
            "OldPassword123!";

    private static final String NEW_PASSWORD =
            "NewPassword123!";

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES =
            new PostgreSQLContainer(
                    "postgres:17-alpine"
            );

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private PasswordResetService passwordResetService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private PasswordResetEmailSender passwordResetEmailSender;

    @Test
    void successfulResetShouldChangeLoginRevokeSessionsAndConsumeCode() {
        AppUser user =
                createUser(
                        true
                );

        LoginResponse originalSession =
                authService.login(
                        new LoginRequest(
                                user.getEmail(),
                                OLD_PASSWORD
                        )
                );

        String code =
                issueResetCode(user);

        passwordResetService.resetPassword(
                new ResetPasswordRequest(
                        user.getEmail(),
                        code,
                        NEW_PASSWORD
                )
        );

        assertThrows(
                InvalidCredentialsException.class,
                () ->
                        authService.login(
                                new LoginRequest(
                                        user.getEmail(),
                                        OLD_PASSWORD
                                )
                        )
        );

        LoginResponse newSession =
                authService.login(
                        new LoginRequest(
                                user.getEmail(),
                                NEW_PASSWORD
                        )
                );

        assertEquals(
                user.getId(),
                newSession.userId()
        );

        assertThrows(
                InvalidRefreshTokenException.class,
                () ->
                        authService.refresh(
                                new RefreshTokenRequest(
                                        originalSession
                                                .refreshToken()
                                )
                        )
        );

        assertThrows(
                PasswordResetException.class,
                () ->
                        passwordResetService
                                .resetPassword(
                                        new ResetPasswordRequest(
                                                user.getEmail(),
                                                code,
                                                NEW_PASSWORD
                                        )
                                )
        );

        assertEquals(
                0,
                challengeCount(
                        user.getId()
                )
        );
    }

    @Test
    void failedResetEmailShouldRollbackChallengeAndCooldown() {
        AppUser user =
                createUser(
                        true
                );

        doThrow(
                new EmailDeliveryException(
                        "Simulated provider failure"
                )
        )
                .when(
                        passwordResetEmailSender
                )
                .sendResetCode(
                        any(UUID.class),
                        any(String.class),
                        any(String.class),
                        any(Instant.class),
                        any(Instant.class)
                );

        passwordResetService.forgotPassword(
                new ForgotPasswordRequest(
                        user.getEmail()
                )
        );

        assertEquals(
                0,
                challengeCount(
                        user.getId()
                )
        );

        reset(
                passwordResetEmailSender
        );

        String code =
                issueResetCode(user);

        assertTrue(
                code.matches("\\d{6}")
        );

        assertEquals(
                1,
                challengeCount(
                        user.getId()
                )
        );
    }

    @Test
    void unverifiedUserShouldRemainUnverifiedAfterReset() {
        AppUser user =
                createUser(
                        false
                );

        String code =
                issueResetCode(user);

        passwordResetService.resetPassword(
                new ResetPasswordRequest(
                        user.getEmail(),
                        code,
                        NEW_PASSWORD
                )
        );

        AppUser updatedUser =
                appUserRepository
                        .findById(
                                user.getId()
                        )
                        .orElseThrow();

        assertFalse(
                updatedUser.isEmailVerified()
        );

        assertTrue(
                passwordEncoder.matches(
                        NEW_PASSWORD,
                        updatedUser.getPasswordHash()
                )
        );

        assertThrows(
                EmailVerificationRequiredException.class,
                () ->
                        authService.login(
                                new LoginRequest(
                                        user.getEmail(),
                                        NEW_PASSWORD
                                )
                        )
        );
    }

    @Test
    void passwordChangedEmailFailureShouldNotRollbackReset() {
        AppUser user =
                createUser(
                        true
                );

        String code =
                issueResetCode(user);

        doThrow(
                new EmailDeliveryException(
                        "Simulated notification failure"
                )
        )
                .when(
                        passwordResetEmailSender
                )
                .sendPasswordChanged(
                        eq(user.getId()),
                        eq(user.getEmail()),
                        any(Instant.class)
                );

        passwordResetService.resetPassword(
                new ResetPasswordRequest(
                        user.getEmail(),
                        code,
                        NEW_PASSWORD
                )
        );

        AppUser updatedUser =
                appUserRepository
                        .findById(
                                user.getId()
                        )
                        .orElseThrow();

        assertTrue(
                passwordEncoder.matches(
                        NEW_PASSWORD,
                        updatedUser.getPasswordHash()
                )
        );

        assertFalse(
                passwordEncoder.matches(
                        OLD_PASSWORD,
                        updatedUser.getPasswordHash()
                )
        );

        assertEquals(
                0,
                challengeCount(
                        user.getId()
                )
        );
    }

    @Test
    void replacementShouldInvalidatePreviousCode() {
        AppUser user =
                createUser(
                        true
                );

        String firstCode =
                issueResetCode(user);

        jdbcTemplate.update(
                """
                UPDATE password_reset_challenges
                SET last_issued_at =
                    CURRENT_TIMESTAMP
                    - INTERVAL '61 seconds'
                WHERE user_id = ?
                """,
                user.getId()
        );

        String secondCode =
                issueResetCode(user);

        assertNotEquals(
                firstCode,
                secondCode
        );

        assertThrows(
                PasswordResetException.class,
                () ->
                        passwordResetService
                                .resetPassword(
                                        new ResetPasswordRequest(
                                                user.getEmail(),
                                                firstCode,
                                                NEW_PASSWORD
                                        )
                                )
        );

        passwordResetService.resetPassword(
                new ResetPasswordRequest(
                        user.getEmail(),
                        secondCode,
                        NEW_PASSWORD
                )
        );

        assertEquals(
                0,
                challengeCount(
                        user.getId()
                )
        );
    }

    private String issueResetCode(
            AppUser user
    ) {
        clearInvocations(
                passwordResetEmailSender
        );

        passwordResetService.forgotPassword(
                new ForgotPasswordRequest(
                        user.getEmail()
                )
        );

        ArgumentCaptor<String> codeCaptor =
                ArgumentCaptor.forClass(
                        String.class
                );

        verify(passwordResetEmailSender)
                .sendResetCode(
                        eq(user.getId()),
                        eq(user.getEmail()),
                        codeCaptor.capture(),
                        any(Instant.class),
                        any(Instant.class)
                );

        return codeCaptor.getValue();
    }

    private AppUser createUser(
            boolean verified
    ) {
        String email =
                "password-reset-"
                        + UUID.randomUUID()
                        + "@example.com";

        AppUser user =
                new AppUser(
                        email,
                        passwordEncoder.encode(
                                OLD_PASSWORD
                        ),
                        "Password",
                        "Reset"
                );

        if (verified) {
            user.markEmailVerified();
        }

        return appUserRepository
                .saveAndFlush(user);
    }

    private int challengeCount(
            UUID userId
    ) {
        Integer count =
                jdbcTemplate.queryForObject(
                        """
                        SELECT COUNT(*)
                        FROM password_reset_challenges
                        WHERE user_id = ?
                        """,
                        Integer.class,
                        userId
                );

        return count == null
                ? 0
                : count;
    }
}