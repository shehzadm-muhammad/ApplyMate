package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class EmailVerificationService {

    private final AppUserRepository appUserRepository;

    private final EmailVerificationCodeRepository
            verificationCodeRepository;

    private final EmailVerificationCodeSecurity codeSecurity;

    private final EmailVerificationProperties properties;

    private final Clock clock;

    @Autowired
    public EmailVerificationService(
            AppUserRepository appUserRepository,
            EmailVerificationCodeRepository verificationCodeRepository,
            EmailVerificationCodeSecurity codeSecurity,
            EmailVerificationProperties properties
    ) {
        this(
                appUserRepository,
                verificationCodeRepository,
                codeSecurity,
                properties,
                Clock.systemUTC()
        );
    }

    EmailVerificationService(
            AppUserRepository appUserRepository,
            EmailVerificationCodeRepository verificationCodeRepository,
            EmailVerificationCodeSecurity codeSecurity,
            EmailVerificationProperties properties,
            Clock clock
    ) {
        this.appUserRepository = appUserRepository;
        this.verificationCodeRepository =
                verificationCodeRepository;
        this.codeSecurity = codeSecurity;
        this.properties = properties;
        this.clock = clock;
    }

    @Transactional
    public IssuedEmailVerificationCode issueInitialCode(
            AppUser user
    ) {
        if (user.getId() == null) {
            throw new IllegalArgumentException(
                    "User must be persisted before verification "
                            + "code issuance"
            );
        }

        if (user.isEmailVerified()) {
            throw new IllegalStateException(
                    "Cannot issue a verification code "
                            + "for a verified user"
            );
        }

        if (verificationCodeRepository
                .findByUserId(user.getId())
                .isPresent()) {
            throw new IllegalStateException(
                    "An email verification challenge "
                            + "already exists for this user"
            );
        }

        Instant now = clock.instant();

        String rawCode = codeSecurity.generateCode();

        String codeHash = codeSecurity.hashCode(
                user.getId(),
                rawCode
        );

        Instant expiresAt =
                now.plus(properties.getCodeTtl());

        EmailVerificationCode challenge =
                new EmailVerificationCode(
                        user.getId(),
                        codeHash,
                        expiresAt,
                        now
                );

        verificationCodeRepository.save(challenge);

        return new IssuedEmailVerificationCode(
                rawCode,
                now,
                expiresAt,
                now.plus(properties.getResendCooldown())
        );
    }

    @Transactional
    public Optional<IssuedEmailVerificationCode> resendCode(
            String email
    ) {
        String normalisedEmail = normaliseEmail(email);

        Optional<AppUser> userResult =
                appUserRepository.findByEmailIgnoreCaseForUpdate(
                        normalisedEmail
                );

        if (userResult.isEmpty()) {
            return Optional.empty();
        }

        AppUser user = userResult.get();

        if (user.isEmailVerified()) {
            return Optional.empty();
        }

        Instant now = clock.instant();

        Optional<EmailVerificationCode> challengeResult =
                verificationCodeRepository.findByUserId(
                        user.getId()
                );

        if (challengeResult.isEmpty()) {
            return Optional.of(
                    createReplacementChallenge(
                            user,
                            now
                    )
            );
        }

        EmailVerificationCode challenge =
                challengeResult.get();

        Instant resendAvailableAt =
                challenge.getLastIssuedAt()
                        .plus(properties.getResendCooldown());

        if (now.isBefore(resendAvailableAt)) {
            throw new VerificationResendCooldownException(
                    secondsUntil(
                            now,
                            resendAvailableAt
                    )
            );
        }

        Instant issueWindowEndsAt =
                challenge.getIssueWindowStartedAt()
                        .plus(properties.getIssueWindow());

        boolean startNewIssueWindow =
                !now.isBefore(issueWindowEndsAt);

        if (
                !startNewIssueWindow
                        && challenge.getIssueCount()
                        >= properties.getMaxIssuesPerWindow()
        ) {
            throw new VerificationRateLimitException(
                    secondsUntil(
                            now,
                            issueWindowEndsAt
                    )
            );
        }

        String rawCode;
String codeHash;

do {
    rawCode =
            codeSecurity.generateCode();

    codeHash =
            codeSecurity.hashCode(
                    user.getId(),
                    rawCode
            );
} while (
        codeHash.equals(
                challenge.getCodeHash()
        )
);

Instant expiresAt =
        now.plus(properties.getCodeTtl());

        challenge.replaceCode(
                codeHash,
                expiresAt,
                now,
                startNewIssueWindow
        );

        verificationCodeRepository.save(challenge);

        return Optional.of(
                new IssuedEmailVerificationCode(
                        rawCode,
                        now,
                        expiresAt,
                        now.plus(
                                properties.getResendCooldown()
                        )
                )
        );
    }

    @Transactional(
            noRollbackFor = {
                    IncorrectVerificationCodeException.class,
                    VerificationAttemptsExceededException.class
            }
    )
    public void verifyEmail(
            String email,
            String rawCode
    ) {
        String normalisedEmail = normaliseEmail(email);

        AppUser user =
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                normalisedEmail
                        )
                        .orElseThrow(
                                IncorrectVerificationCodeException::new
                        );

        if (user.isEmailVerified()) {
            return;
        }

        EmailVerificationCode challenge =
                verificationCodeRepository
                        .findByUserId(user.getId())
                        .orElseThrow(
                                IncorrectVerificationCodeException::new
                        );

        Instant now = clock.instant();

        if (challenge.isExpired(now)) {
            throw new VerificationCodeExpiredException();
        }

        if (
                challenge.getFailedAttempts()
                        >= properties.getMaxAttempts()
        ) {
            throw new VerificationAttemptsExceededException();
        }

        boolean codeMatches =
                codeSecurity.matches(
                        user.getId(),
                        rawCode,
                        challenge.getCodeHash()
                );

        if (!codeMatches) {
            challenge.recordFailedAttempt();

            verificationCodeRepository.save(challenge);

            if (
                    challenge.getFailedAttempts()
                            >= properties.getMaxAttempts()
            ) {
                throw new VerificationAttemptsExceededException();
            }

            throw new IncorrectVerificationCodeException();
        }

        user.markEmailVerified();

        appUserRepository.save(user);

        verificationCodeRepository.delete(challenge);
    }

    private IssuedEmailVerificationCode
            createReplacementChallenge(
                    AppUser user,
                    Instant now
            ) {
        String rawCode =
                codeSecurity.generateCode();

        String codeHash =
                codeSecurity.hashCode(
                        user.getId(),
                        rawCode
                );

        Instant expiresAt =
                now.plus(properties.getCodeTtl());

        EmailVerificationCode challenge =
                new EmailVerificationCode(
                        user.getId(),
                        codeHash,
                        expiresAt,
                        now
                );

        verificationCodeRepository.save(challenge);

        return new IssuedEmailVerificationCode(
                rawCode,
                now,
                expiresAt,
                now.plus(properties.getResendCooldown())
        );
    }

    private String normaliseEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private long secondsUntil(
            Instant now,
            Instant target
    ) {
        long remainingMillis =
                Duration.between(now, target)
                        .toMillis();

        return Math.max(
                1L,
                (remainingMillis + 999L) / 1000L
        );
    }
}