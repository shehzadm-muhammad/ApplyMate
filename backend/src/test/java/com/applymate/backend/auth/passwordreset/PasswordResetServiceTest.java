package com.applymate.backend.auth.passwordreset;

import com.applymate.backend.auth.RefreshTokenService;
import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    private static final Instant NOW =
            Instant.parse("2026-08-12T12:00:00Z");

    private static final String TEST_PEPPER =
            "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private PasswordResetChallengeRepository challengeRepository;

    @Mock
    private PasswordResetEmailSender emailSender;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenService refreshTokenService;

    @Mock
    private PlatformTransactionManager transactionManager;

    @Mock
    private TransactionStatus transactionStatus;

    private PasswordResetService service;

    @BeforeEach
    void setUp() {
        when(
                transactionManager.getTransaction(
                        any(TransactionDefinition.class)
                )
        ).thenReturn(transactionStatus);

        service =
                new PasswordResetService(
                        appUserRepository,
                        challengeRepository,
                        emailSender,
                        passwordEncoder,
                        refreshTokenService,
                        transactionManager,
                        TEST_PEPPER,
                        Duration.ofMinutes(10),
                        Duration.ofSeconds(60),
                        5,
                        Duration.ofHours(1),
                        5,
                        Duration.ZERO,
                        Clock.fixed(
                                NOW,
                                ZoneOffset.UTC
                        )
                );
    }

    @Test
    void shouldIssueResetCodeForExistingUser() {
        AppUser user =
                createUser(
                        "user@example.com"
                );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "user@example.com"
                        )
        ).thenReturn(
                Optional.of(user)
        );

        when(
                challengeRepository
                        .findByUserIdForUpdate(
                                user.getId()
                        )
        ).thenReturn(
                Optional.empty()
        );

        service.forgotPassword(
                new ForgotPasswordRequest(
                        " USER@EXAMPLE.COM "
                )
        );

        ArgumentCaptor<PasswordResetChallenge>
                challengeCaptor =
                ArgumentCaptor.forClass(
                        PasswordResetChallenge.class
                );

        verify(challengeRepository)
                .saveAndFlush(
                        challengeCaptor.capture()
                );

        ArgumentCaptor<String> codeCaptor =
                ArgumentCaptor.forClass(
                        String.class
                );

        verify(emailSender)
                .sendResetCode(
                        eq(user.getId()),
                        eq(user.getEmail()),
                        codeCaptor.capture(),
                        eq(NOW),
                        eq(
                                NOW.plus(
                                        Duration.ofMinutes(10)
                                )
                        )
                );

        String rawCode =
                codeCaptor.getValue();

        PasswordResetChallenge challenge =
                challengeCaptor.getValue();

        assertTrue(
                rawCode.matches("\\d{6}")
        );

        assertEquals(
                64,
                challenge.getCodeHash().length()
        );

        assertNotEquals(
                rawCode,
                challenge.getCodeHash()
        );

        assertEquals(
                hashCode(
                        user.getId(),
                        rawCode
                ),
                challenge.getCodeHash()
        );

        assertEquals(
                0,
                challenge.getFailedAttempts()
        );

        assertEquals(
                1,
                challenge.getIssueCount()
        );
    }

    @Test
    void shouldReturnNormallyForUnknownEmail() {
        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "unknown@example.com"
                        )
        ).thenReturn(
                Optional.empty()
        );

        service.forgotPassword(
                new ForgotPasswordRequest(
                        " UNKNOWN@EXAMPLE.COM "
                )
        );

        verifyNoInteractions(
                challengeRepository,
                emailSender
        );
    }

    @Test
    void shouldEnforceResetRequestCooldownInternally() {
        AppUser user =
                createUser(
                        "cooldown@example.com"
                );

        PasswordResetChallenge challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(
                                Duration.ofMinutes(5)
                        )
                );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                user.getEmail()
                        )
        ).thenReturn(
                Optional.of(user)
        );

        when(
                challengeRepository
                        .findByUserIdForUpdate(
                                user.getId()
                        )
        ).thenReturn(
                Optional.of(challenge)
        );

        service.forgotPassword(
                new ForgotPasswordRequest(
                        user.getEmail()
                )
        );

        verify(
                emailSender,
                never()
        ).sendResetCode(
                any(),
                any(),
                any(),
                any(),
                any()
        );

        verify(
                challengeRepository,
                never()
        ).saveAndFlush(any());
    }

    @Test
    void shouldEnforceIssueWindowRateLimitInternally() {
        AppUser user =
                createUser(
                        "rate@example.com"
                );

        PasswordResetChallenge challenge =
                createChallenge(
                        user,
                        "111111",
                        NOW.minus(
                                Duration.ofMinutes(30)
                        ),
                        NOW.plus(
                                Duration.ofMinutes(5)
                        )
                );

        for (int i = 0; i < 4; i++) {
            challenge.replaceCode(
                    hashCode(
                            user.getId(),
                            "222222"
                    ),
                    NOW.plus(
                            Duration.ofMinutes(5)
                    ),
                    NOW.minusSeconds(61),
                    false
            );
        }

        assertEquals(
                5,
                challenge.getIssueCount()
        );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                user.getEmail()
                        )
        ).thenReturn(
                Optional.of(user)
        );

        when(
                challengeRepository
                        .findByUserIdForUpdate(
                                user.getId()
                        )
        ).thenReturn(
                Optional.of(challenge)
        );

        service.forgotPassword(
                new ForgotPasswordRequest(
                        user.getEmail()
                )
        );

        verify(
                emailSender,
                never()
        ).sendResetCode(
                any(),
                any(),
                any(),
                any(),
                any()
        );

        verify(
                challengeRepository,
                never()
        ).saveAndFlush(any());
    }

    @Test
    void shouldRecordIncorrectCodeAttempt() {
        AppUser user =
                createUser(
                        "wrong@example.com"
                );

        PasswordResetChallenge challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(
                                Duration.ofMinutes(5)
                        )
                );

        prepareReset(
                user,
                challenge
        );

        assertThrows(
                PasswordResetException.class,
                () ->
                        service.resetPassword(
                                new ResetPasswordRequest(
                                        user.getEmail(),
                                        "654321",
                                        "NewPassword123!"
                                )
                        )
        );

        assertEquals(
                1,
                challenge.getFailedAttempts()
        );

        verify(challengeRepository)
                .saveAndFlush(challenge);

        verify(
                passwordEncoder,
                never()
        ).encode(any());
    }

    @Test
    void shouldRejectExpiredCodeWithGenericFailure() {
        AppUser user =
                createUser(
                        "expired@example.com"
                );

        PasswordResetChallenge challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minus(
                                Duration.ofMinutes(10)
                        ),
                        NOW
                );

        prepareReset(
                user,
                challenge
        );

        assertThrows(
                PasswordResetException.class,
                () ->
                        service.resetPassword(
                                new ResetPasswordRequest(
                                        user.getEmail(),
                                        "123456",
                                        "NewPassword123!"
                                )
                        )
        );

        assertEquals(
                0,
                challenge.getFailedAttempts()
        );

        verify(
                passwordEncoder,
                never()
        ).encode(any());
    }

    @Test
    void shouldRejectCodeAfterMaximumAttempts() {
        AppUser user =
                createUser(
                        "blocked@example.com"
                );

        PasswordResetChallenge challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(
                                Duration.ofMinutes(5)
                        )
                );

        for (int i = 0; i < 5; i++) {
            challenge.recordFailedAttempt();
        }

        prepareReset(
                user,
                challenge
        );

        assertThrows(
                PasswordResetException.class,
                () ->
                        service.resetPassword(
                                new ResetPasswordRequest(
                                        user.getEmail(),
                                        "123456",
                                        "NewPassword123!"
                                )
                        )
        );

        verify(
                passwordEncoder,
                never()
        ).encode(any());
    }

    @Test
    void shouldResetPasswordAndRevokeRefreshSessions() {
        AppUser user =
                createUser(
                        "success@example.com"
                );

        PasswordResetChallenge challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(
                                Duration.ofMinutes(5)
                        )
                );

        prepareReset(
                user,
                challenge
        );

        when(
                passwordEncoder.encode(
                        "NewPassword123!"
                )
        ).thenReturn(
                "encoded-new-password"
        );

        service.resetPassword(
                new ResetPasswordRequest(
                        user.getEmail(),
                        "123456",
                        "NewPassword123!"
                )
        );

        assertEquals(
                "encoded-new-password",
                user.getPasswordHash()
        );

        assertFalse(
                user.isEmailVerified()
        );

        verify(appUserRepository)
                .save(user);

        verify(refreshTokenService)
                .revokeAllForUser(
                        user.getId()
                );

        verify(challengeRepository)
                .delete(challenge);

        verify(emailSender)
                .sendPasswordChanged(
                        user.getId(),
                        user.getEmail(),
                        NOW
                );
    }

    @Test
    void codeIssuedForAnotherAccountCannotResetUser() {
        AppUser firstUser =
                createUser(
                        "first@example.com"
                );

        AppUser secondUser =
                createUser(
                        "second@example.com"
                );

        String firstUsersCode =
                "111111";

        PasswordResetChallenge secondChallenge =
                createChallenge(
                        secondUser,
                        "222222",
                        NOW.minusSeconds(30),
                        NOW.plus(
                                Duration.ofMinutes(5)
                        )
                );

        prepareReset(
                secondUser,
                secondChallenge
        );

        assertThrows(
                PasswordResetException.class,
                () ->
                        service.resetPassword(
                                new ResetPasswordRequest(
                                        secondUser.getEmail(),
                                        firstUsersCode,
                                        "NewPassword123!"
                                )
                        )
        );

        assertEquals(
                1,
                secondChallenge.getFailedAttempts()
        );

        assertNotEquals(
                firstUser.getId(),
                secondUser.getId()
        );

        verify(
                passwordEncoder,
                never()
        ).encode(any());
    }

    private void prepareReset(
            AppUser user,
            PasswordResetChallenge challenge
    ) {
        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                user.getEmail()
                        )
        ).thenReturn(
                Optional.of(user)
        );

        when(
                challengeRepository
                        .findByUserIdForUpdate(
                                user.getId()
                        )
        ).thenReturn(
                Optional.of(challenge)
        );
    }

    private PasswordResetChallenge createChallenge(
            AppUser user,
            String rawCode,
            Instant issuedAt,
            Instant expiresAt
    ) {
        return new PasswordResetChallenge(
                user.getId(),
                hashCode(
                        user.getId(),
                        rawCode
                ),
                expiresAt,
                issuedAt
        );
    }

    private AppUser createUser(
            String email
    ) {
        AppUser user =
                new AppUser(
                        email,
                        "old-password-hash",
                        "Test",
                        "User"
                );

        setUserId(
                user,
                UUID.randomUUID()
        );

        return user;
    }

    private String hashCode(
            UUID userId,
            String rawCode
    ) {
        try {
            Mac mac =
                    Mac.getInstance(
                            "HmacSHA256"
                    );

            mac.init(
                    new SecretKeySpec(
                            Base64.getDecoder()
                                    .decode(
                                            TEST_PEPPER
                                    ),
                            "HmacSHA256"
                    )
            );

            String value =
                    "password-reset:"
                            + userId
                            + ":"
                            + rawCode;

            byte[] hash =
                    mac.doFinal(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            return HexFormat.of()
                    .formatHex(hash);

        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                    exception
            );
        }
    }

    private void setUserId(
            AppUser user,
            UUID userId
    ) {
        try {
            Field idField =
                    AppUser.class
                            .getDeclaredField(
                                    "id"
                            );

            idField.setAccessible(true);

            idField.set(
                    user,
                    userId
            );

        } catch (
                NoSuchFieldException
                        | IllegalAccessException exception
        ) {
            throw new IllegalStateException(
                    "Unable to assign test user ID",
                    exception
            );
        }
    }
}