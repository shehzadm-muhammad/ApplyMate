package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.lang.reflect.Field;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.times;

class EmailVerificationServiceTest {

    private static final Instant NOW =
            Instant.parse("2026-08-09T16:00:00Z");

    private AppUserRepository appUserRepository;

    private EmailVerificationCodeRepository
            verificationCodeRepository;

    private EmailVerificationProperties properties;

    private EmailVerificationCodeSecurity codeSecurity;

    private EmailVerificationService service;

    @BeforeEach
    void setUp() {
        appUserRepository =
                mock(AppUserRepository.class);

        verificationCodeRepository =
                mock(EmailVerificationCodeRepository.class);

        properties = createProperties();

        codeSecurity =
                new EmailVerificationCodeSecurity(properties);

        Clock clock =
                Clock.fixed(NOW, ZoneOffset.UTC);

        service = new EmailVerificationService(
                appUserRepository,
                verificationCodeRepository,
                codeSecurity,
                properties,
                clock
        );
    }

    @Test
    void shouldIssueInitialVerificationCode() {
        AppUser user = createUser(
                "new.user@example.com"
        );

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.empty());

        IssuedEmailVerificationCode issued =
                service.issueInitialCode(user);

        ArgumentCaptor<EmailVerificationCode> captor =
                ArgumentCaptor.forClass(
                        EmailVerificationCode.class
                );

        verify(verificationCodeRepository)
                .save(captor.capture());

        EmailVerificationCode challenge =
                captor.getValue();

        assertTrue(issued.rawCode().matches("\\d{6}"));

        assertEquals(
                NOW.plus(Duration.ofMinutes(10)),
                issued.expiresAt()
        );

        assertEquals(
                NOW.plus(Duration.ofSeconds(60)),
                issued.resendAvailableAt()
        );

        assertEquals(
                user.getId(),
                challenge.getUserId()
        );

        assertEquals(
                0,
                challenge.getFailedAttempts()
        );

        assertEquals(
                1,
                challenge.getIssueCount()
        );

        assertTrue(
                codeSecurity.matches(
                        user.getId(),
                        issued.rawCode(),
                        challenge.getCodeHash()
                )
        );
    }

    @Test
    void shouldNotIssueInitialCodeForVerifiedUser() {
        AppUser user =
                createUser("verified@example.com");

        user.markEmailVerified();

        assertThrows(
                IllegalStateException.class,
                () -> service.issueInitialCode(user)
        );

        verifyNoInteractions(
                verificationCodeRepository
        );
    }

    @Test
    void shouldVerifyCorrectCode() {
        AppUser user =
                createUser("verify@example.com");

        String rawCode = "123456";

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        rawCode,
                        NOW.minusSeconds(30),
                        NOW.plus(Duration.ofMinutes(5))
                );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "verify@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        service.verifyEmail(
                " VERIFY@EXAMPLE.COM ",
                rawCode
        );

        assertTrue(user.isEmailVerified());

        verify(appUserRepository).save(user);

        verify(verificationCodeRepository)
                .delete(challenge);
    }

    @Test
    void shouldRecordIncorrectVerificationAttempt() {
        AppUser user =
                createUser("wrong@example.com");

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(Duration.ofMinutes(5))
                );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "wrong@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        assertThrows(
                IncorrectVerificationCodeException.class,
                () -> service.verifyEmail(
                        "wrong@example.com",
                        "654321"
                )
        );

        assertEquals(
                1,
                challenge.getFailedAttempts()
        );

        assertFalse(user.isEmailVerified());

        verify(verificationCodeRepository)
                .save(challenge);

        verify(
                appUserRepository,
                never()
        ).save(user);
    }

    @Test
    void shouldBlockCodeOnFifthIncorrectAttempt() {
        AppUser user =
                createUser("attempts@example.com");

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(Duration.ofMinutes(5))
                );

        for (int i = 0; i < 4; i++) {
            challenge.recordFailedAttempt();
        }

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "attempts@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        assertThrows(
                VerificationAttemptsExceededException.class,
                () -> service.verifyEmail(
                        "attempts@example.com",
                        "654321"
                )
        );

        assertEquals(
                5,
                challenge.getFailedAttempts()
        );

        verify(verificationCodeRepository)
                .save(challenge);
    }

    @Test
    void shouldRejectAlreadyBlockedCode() {
        AppUser user =
                createUser("blocked@example.com");

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(Duration.ofMinutes(5))
                );

        for (int i = 0; i < 5; i++) {
            challenge.recordFailedAttempt();
        }

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "blocked@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        assertThrows(
                VerificationAttemptsExceededException.class,
                () -> service.verifyEmail(
                        "blocked@example.com",
                        "123456"
                )
        );

        assertFalse(user.isEmailVerified());

        verify(
                verificationCodeRepository,
                never()
        ).delete(any());
    }

    @Test
    void shouldRejectExpiredCode() {
        AppUser user =
                createUser("expired@example.com");

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minus(Duration.ofMinutes(11)),
                        NOW
                );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "expired@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        assertThrows(
                VerificationCodeExpiredException.class,
                () -> service.verifyEmail(
                        "expired@example.com",
                        "123456"
                )
        );

        assertFalse(user.isEmailVerified());

        verify(
                appUserRepository,
                never()
        ).save(user);
    }

    @Test
    void shouldEnforceResendCooldown() {
        AppUser user =
                createUser("cooldown@example.com");

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        "123456",
                        NOW.minusSeconds(30),
                        NOW.plus(Duration.ofMinutes(5))
                );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "cooldown@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        VerificationResendCooldownException exception =
                assertThrows(
                        VerificationResendCooldownException.class,
                        () -> service.resendCode(
                                "cooldown@example.com"
                        )
                );

        assertEquals(
                30,
                exception.getRetryAfterSeconds()
        );
    }

    @Test
    void shouldReplaceOldCodeOnResend() {
        AppUser user =
                createUser("resend@example.com");

        String oldCode = "123456";

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        oldCode,
                        NOW.minusSeconds(61),
                        NOW.plus(Duration.ofMinutes(3))
                );

        challenge.recordFailedAttempt();
        challenge.recordFailedAttempt();

        String oldHash =
                challenge.getCodeHash();

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "resend@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        IssuedEmailVerificationCode issued =
                service.resendCode(
                        "resend@example.com"
                ).orElseThrow();

        assertEquals(
                0,
                challenge.getFailedAttempts()
        );

        assertEquals(
                2,
                challenge.getIssueCount()
        );

        assertFalse(
                oldHash.equals(
                        challenge.getCodeHash()
                )
        );

        assertFalse(
                codeSecurity.matches(
                        user.getId(),
                        oldCode,
                        challenge.getCodeHash()
                )
        );

        assertTrue(
                codeSecurity.matches(
                        user.getId(),
                        issued.rawCode(),
                        challenge.getCodeHash()
                )
        );

        assertEquals(
                NOW.plus(Duration.ofMinutes(10)),
                challenge.getExpiresAt()
        );

        verify(verificationCodeRepository)
                .save(challenge);
    }

    @Test
    void shouldEnforceIssueWindowRateLimit() {
        AppUser user =
                createUser("rate@example.com");

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        "111111",
                        NOW.minus(Duration.ofMinutes(30)),
                        NOW.plus(Duration.ofMinutes(5))
                );

        for (int i = 0; i < 4; i++) {
            challenge.replaceCode(
                    codeSecurity.hashCode(
                            user.getId(),
                            "111111"
                    ),
                    NOW.plus(Duration.ofMinutes(5)),
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
                                "rate@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        VerificationRateLimitException exception =
                assertThrows(
                        VerificationRateLimitException.class,
                        () -> service.resendCode(
                                "rate@example.com"
                        )
                );

        assertEquals(
                1800,
                exception.getRetryAfterSeconds()
        );
    }

    @Test
    void shouldStartNewIssueWindowAtBoundary() {
        AppUser user =
                createUser("window@example.com");

        EmailVerificationCode challenge =
                createChallenge(
                        user,
                        "111111",
                        NOW.minus(Duration.ofHours(1)),
                        NOW.plus(Duration.ofMinutes(5))
                );

        for (int i = 0; i < 4; i++) {
            challenge.replaceCode(
                    codeSecurity.hashCode(
                            user.getId(),
                            "111111"
                    ),
                    NOW.plus(Duration.ofMinutes(5)),
                    NOW.minusSeconds(61),
                    false
            );
        }

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "window@example.com"
                        )
        ).thenReturn(Optional.of(user));

        when(
                verificationCodeRepository.findByUserId(
                        user.getId()
                )
        ).thenReturn(Optional.of(challenge));

        service.resendCode(
                "window@example.com"
        ).orElseThrow();

        assertEquals(
                1,
                challenge.getIssueCount()
        );

        assertEquals(
                NOW,
                challenge.getIssueWindowStartedAt()
        );
    }

    @Test
    void shouldReturnEmptyForUnknownResendEmail() {
        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "unknown@example.com"
                        )
        ).thenReturn(Optional.empty());

        Optional<IssuedEmailVerificationCode> result =
                service.resendCode(
                        " UNKNOWN@EXAMPLE.COM "
                );

        assertTrue(result.isEmpty());

        verifyNoInteractions(
                verificationCodeRepository
        );
    }

    @Test
    void shouldReturnEmptyWhenVerifiedUserRequestsResend() {
        AppUser user =
                createUser("verified@example.com");

        user.markEmailVerified();

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "verified@example.com"
                        )
        ).thenReturn(Optional.of(user));

        Optional<IssuedEmailVerificationCode> result =
                service.resendCode(
                        "verified@example.com"
                );

        assertTrue(result.isEmpty());

        verifyNoInteractions(
                verificationCodeRepository
        );
    }

    @Test
    void codeForOneUserCannotVerifyAnotherUser() {
        AppUser firstUser =
                createUser("first@example.com");

        AppUser secondUser =
                createUser("second@example.com");

        String firstUsersCode = "123456";

        EmailVerificationCode firstUsersChallenge =
                createChallenge(
                        firstUser,
                        firstUsersCode,
                        NOW.minusSeconds(30),
                        NOW.plus(Duration.ofMinutes(5))
                );

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "second@example.com"
                        )
        ).thenReturn(Optional.of(secondUser));

        when(
                verificationCodeRepository.findByUserId(
                        secondUser.getId()
                )
        ).thenReturn(
                Optional.of(firstUsersChallenge)
        );

        assertThrows(
                IncorrectVerificationCodeException.class,
                () -> service.verifyEmail(
                        "second@example.com",
                        firstUsersCode
                )
        );

        assertFalse(
                secondUser.isEmailVerified()
        );
    }

    @Test
    void verifyingAlreadyVerifiedUserIsIdempotent() {
        AppUser user =
                createUser("done@example.com");

        user.markEmailVerified();

        when(
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                "done@example.com"
                        )
        ).thenReturn(Optional.of(user));

        service.verifyEmail(
                "done@example.com",
                "000000"
        );

        assertTrue(user.isEmailVerified());

        verifyNoInteractions(
                verificationCodeRepository
        );
    }

    private EmailVerificationProperties
            createProperties() {
        EmailVerificationProperties result =
                new EmailVerificationProperties();

        byte[] pepper = new byte[32];

        for (int i = 0; i < pepper.length; i++) {
            pepper[i] = (byte) (i + 1);
        }

        result.setPepper(
                Base64.getEncoder()
                        .encodeToString(pepper)
        );

        result.setCodeTtl(
                Duration.ofMinutes(10)
        );

        result.setResendCooldown(
                Duration.ofSeconds(60)
        );

        result.setMaxAttempts(5);

        result.setIssueWindow(
                Duration.ofHours(1)
        );

        result.setMaxIssuesPerWindow(5);

        return result;
    }

    private AppUser createUser(String email) {
        AppUser user =
                new AppUser(
                        email,
                        "password-hash",
                        "Test",
                        "User"
                );

        setUserId(
                user,
                UUID.randomUUID()
        );

        return user;
    }

    private EmailVerificationCode createChallenge(
            AppUser user,
            String rawCode,
            Instant issuedAt,
            Instant expiresAt
    ) {
        return new EmailVerificationCode(
                user.getId(),
                codeSecurity.hashCode(
                        user.getId(),
                        rawCode
                ),
                expiresAt,
                issuedAt
        );
    }

    private void setUserId(
            AppUser user,
            UUID userId
    ) {
        try {
            Field idField =
                    AppUser.class.getDeclaredField("id");

            idField.setAccessible(true);
            idField.set(user, userId);
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
    @Test
void resendShouldRegenerateWhenNewCodeMatchesPreviousCode() {
    AppUser user =
            createUser(
                    "collision@example.com"
            );

    EmailVerificationCodeSecurity collisionSecurity =
            mock(
                    EmailVerificationCodeSecurity.class
            );

    String oldCode = "111111";
    String newCode = "222222";

    String oldHash = "old-code-hash";
    String newHash = "new-code-hash";

    EmailVerificationCode challenge =
            new EmailVerificationCode(
                    user.getId(),
                    oldHash,
                    NOW.plus(
                            Duration.ofMinutes(5)
                    ),
                    NOW.minusSeconds(61)
            );

    when(
            appUserRepository
                    .findByEmailIgnoreCaseForUpdate(
                            "collision@example.com"
                    )
    ).thenReturn(
            Optional.of(user)
    );

    when(
            verificationCodeRepository
                    .findByUserId(
                            user.getId()
                    )
    ).thenReturn(
            Optional.of(challenge)
    );

    when(
            collisionSecurity.generateCode()
    ).thenReturn(
            oldCode,
            newCode
    );

    when(
            collisionSecurity.hashCode(
                    user.getId(),
                    oldCode
            )
    ).thenReturn(oldHash);

    when(
            collisionSecurity.hashCode(
                    user.getId(),
                    newCode
            )
    ).thenReturn(newHash);

    EmailVerificationService collisionService =
            new EmailVerificationService(
                    appUserRepository,
                    verificationCodeRepository,
                    collisionSecurity,
                    properties,
                    Clock.fixed(
                            NOW,
                            ZoneOffset.UTC
                    )
            );

    IssuedEmailVerificationCode issued =
            collisionService
                    .resendCode(
                            "collision@example.com"
                    )
                    .orElseThrow();

    assertEquals(
            newCode,
            issued.rawCode()
    );

    assertEquals(
            newHash,
            challenge.getCodeHash()
    );

    verify(
            collisionSecurity,
            times(2)
    ).generateCode();

    verify(
            verificationCodeRepository
    ).save(challenge);
}
}