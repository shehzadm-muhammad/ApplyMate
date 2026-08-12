package com.applymate.backend.auth.passwordreset;

import com.applymate.backend.auth.EmailDeliveryException;
import com.applymate.backend.auth.RefreshTokenService;
import com.applymate.backend.user.AppUser;
import com.applymate.backend.user.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    PasswordResetService.class
            );

    private static final String HMAC_ALGORITHM =
            "HmacSHA256";

    private static final String HMAC_DOMAIN =
            "password-reset:";

    private static final int CODE_BOUND =
            1_000_000;

    private static final int MINIMUM_PEPPER_BYTES =
            32;

    private final AppUserRepository appUserRepository;

    private final PasswordResetChallengeRepository
            challengeRepository;

    private final PasswordResetEmailSender emailSender;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenService refreshTokenService;

    private final TransactionTemplate transactionTemplate;

    private final byte[] pepper;

    private final Duration codeTtl;

    private final Duration resendCooldown;

    private final int maxAttempts;

    private final Duration issueWindow;

    private final int maxIssuesPerWindow;

    private final Duration minimumResponseDuration;

    private final Clock clock;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Autowired
    public PasswordResetService(
            AppUserRepository appUserRepository,

            PasswordResetChallengeRepository challengeRepository,

            PasswordResetEmailSender emailSender,

            PasswordEncoder passwordEncoder,

            RefreshTokenService refreshTokenService,

            PlatformTransactionManager transactionManager,

            @Value("${security.password-reset.pepper}")
            String configuredPepper,

            @Value("${security.password-reset.code-ttl:PT10M}")
            Duration codeTtl,

            @Value("${security.password-reset.resend-cooldown:PT60S}")
            Duration resendCooldown,

            @Value("${security.password-reset.max-attempts:5}")
            int maxAttempts,

            @Value("${security.password-reset.issue-window:PT1H}")
            Duration issueWindow,

            @Value("${security.password-reset.max-issues-per-window:5}")
            int maxIssuesPerWindow,

            @Value("${security.password-reset.minimum-response-duration:PT1S}")
            Duration minimumResponseDuration
    ) {
        this(
                appUserRepository,
                challengeRepository,
                emailSender,
                passwordEncoder,
                refreshTokenService,
                transactionManager,
                configuredPepper,
                codeTtl,
                resendCooldown,
                maxAttempts,
                issueWindow,
                maxIssuesPerWindow,
                minimumResponseDuration,
                Clock.systemUTC()
        );
    }

    PasswordResetService(
            AppUserRepository appUserRepository,

            PasswordResetChallengeRepository challengeRepository,

            PasswordResetEmailSender emailSender,

            PasswordEncoder passwordEncoder,

            RefreshTokenService refreshTokenService,

            PlatformTransactionManager transactionManager,

            String configuredPepper,

            Duration codeTtl,

            Duration resendCooldown,

            int maxAttempts,

            Duration issueWindow,

            int maxIssuesPerWindow,

            Duration minimumResponseDuration,

            Clock clock
    ) {
        this.appUserRepository =
                appUserRepository;

        this.challengeRepository =
                challengeRepository;

        this.emailSender =
                emailSender;

        this.passwordEncoder =
                passwordEncoder;

        this.refreshTokenService =
                refreshTokenService;

        this.transactionTemplate =
                new TransactionTemplate(
                        transactionManager
                );

        this.pepper =
                decodePepper(configuredPepper);

        this.codeTtl =
                requirePositive(
                        codeTtl,
                        "code TTL"
                );

        this.resendCooldown =
                requirePositive(
                        resendCooldown,
                        "resend cooldown"
                );

        this.maxAttempts =
                requirePositive(
                        maxAttempts,
                        "maximum attempts"
                );

        this.issueWindow =
                requirePositive(
                        issueWindow,
                        "issue window"
                );

        this.maxIssuesPerWindow =
                requirePositive(
                        maxIssuesPerWindow,
                        "maximum issues per window"
                );

        if (
                minimumResponseDuration == null
                        || minimumResponseDuration.isNegative()
        ) {
            throw new IllegalStateException(
                    "Password reset minimum response duration "
                            + "must not be negative"
            );
        }

        this.minimumResponseDuration =
                minimumResponseDuration;

        this.clock = clock;
    }

    public void forgotPassword(
            ForgotPasswordRequest request
    ) {
        long startedAtNanos =
                System.nanoTime();

        try {
            try {
                transactionTemplate.executeWithoutResult(
                        status ->
                                issueResetCode(
                                        request.email()
                                )
                );
            } catch (EmailDeliveryException exception) {
                LOGGER.warn(
                        "Password reset code email "
                                + "delivery failed"
                );
            }
        } finally {
            enforceMinimumResponseDuration(
                    startedAtNanos
            );
        }
    }

    public void resetPassword(
            ResetPasswordRequest request
    ) {
        Optional<PasswordChangedNotification> result =
                transactionTemplate.execute(
                        status ->
                                resetPasswordInTransaction(
                                        request
                                )
                );

        if (
                result == null
                        || result.isEmpty()
        ) {
            throw new PasswordResetException();
        }

        PasswordChangedNotification notification =
                result.get();

        try {
            emailSender.sendPasswordChanged(
                    notification.userId(),
                    notification.recipientEmail(),
                    notification.changedAt()
            );
        } catch (EmailDeliveryException exception) {
            LOGGER.warn(
                    "Password-changed notification "
                            + "delivery failed"
            );
        }
    }

    private void issueResetCode(
            String email
    ) {
        String normalisedEmail =
                normaliseEmail(email);

        Optional<AppUser> userResult =
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                normalisedEmail
                        );

        if (userResult.isEmpty()) {
            return;
        }

        AppUser user =
                userResult.get();

        if (!user.isEnabled()) {
            return;
        }

        Instant now =
                clock.instant();

        Optional<PasswordResetChallenge>
                challengeResult =
                challengeRepository
                        .findByUserIdForUpdate(
                                user.getId()
                        );

        if (challengeResult.isEmpty()) {
            createAndSendChallenge(
                    user,
                    null,
                    now,
                    true
            );

            return;
        }

        PasswordResetChallenge challenge =
                challengeResult.get();

        Instant resendAvailableAt =
                challenge.getLastIssuedAt()
                        .plus(resendCooldown);

        if (now.isBefore(resendAvailableAt)) {
            return;
        }

        Instant issueWindowEndsAt =
                challenge.getIssueWindowStartedAt()
                        .plus(issueWindow);

        boolean startNewIssueWindow =
                !now.isBefore(
                        issueWindowEndsAt
                );

        if (
                !startNewIssueWindow
                        && challenge.getIssueCount()
                        >= maxIssuesPerWindow
        ) {
            return;
        }

        createAndSendChallenge(
                user,
                challenge,
                now,
                startNewIssueWindow
        );
    }

    private void createAndSendChallenge(
            AppUser user,
            PasswordResetChallenge existingChallenge,
            Instant issuedAt,
            boolean startNewIssueWindow
    ) {
        String rawCode;
        String codeHash;

        do {
            rawCode =
                    generateCode();

            codeHash =
                    hashCode(
                            user.getId(),
                            rawCode
                    );

        } while (
                existingChallenge != null
                        && codeHash.equals(
                        existingChallenge.getCodeHash()
                )
        );

        Instant expiresAt =
                issuedAt.plus(codeTtl);

        if (existingChallenge == null) {
            PasswordResetChallenge challenge =
                    new PasswordResetChallenge(
                            user.getId(),
                            codeHash,
                            expiresAt,
                            issuedAt
                    );

            challengeRepository.saveAndFlush(
                    challenge
            );

        } else {
            existingChallenge.replaceCode(
                    codeHash,
                    expiresAt,
                    issuedAt,
                    startNewIssueWindow
            );

            challengeRepository.saveAndFlush(
                    existingChallenge
            );
        }

        emailSender.sendResetCode(
                user.getId(),
                user.getEmail(),
                rawCode,
                issuedAt,
                expiresAt
        );
    }

    private Optional<PasswordChangedNotification>
            resetPasswordInTransaction(
                    ResetPasswordRequest request
            ) {

        String normalisedEmail =
                normaliseEmail(
                        request.email()
                );

        Optional<AppUser> userResult =
                appUserRepository
                        .findByEmailIgnoreCaseForUpdate(
                                normalisedEmail
                        );

        if (userResult.isEmpty()) {
            return Optional.empty();
        }

        AppUser user =
                userResult.get();

        if (!user.isEnabled()) {
            return Optional.empty();
        }

        Optional<PasswordResetChallenge>
                challengeResult =
                challengeRepository
                        .findByUserIdForUpdate(
                                user.getId()
                        );

        if (challengeResult.isEmpty()) {
            return Optional.empty();
        }

        PasswordResetChallenge challenge =
                challengeResult.get();

        Instant now =
                clock.instant();

        if (
                challenge.isExpired(now)
                        || challenge.getFailedAttempts()
                        >= maxAttempts
        ) {
            return Optional.empty();
        }

        if (
                !codeMatches(
                        user.getId(),
                        request.code(),
                        challenge.getCodeHash()
                )
        ) {
            challenge.recordFailedAttempt();

            challengeRepository.saveAndFlush(
                    challenge
            );

            return Optional.empty();
        }

        user.changePassword(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        appUserRepository.save(user);

        refreshTokenService.revokeAllForUser(
                user.getId()
        );

        challengeRepository.delete(
                challenge
        );

        return Optional.of(
                new PasswordChangedNotification(
                        user.getId(),
                        user.getEmail(),
                        now
                )
        );
    }

    private String generateCode() {
        int value =
                secureRandom.nextInt(
                        CODE_BOUND
                );

        return String.format(
                Locale.ROOT,
                "%06d",
                value
        );
    }

    private String hashCode(
            UUID userId,
            String rawCode
    ) {
        return HexFormat.of()
                .formatHex(
                        calculateHash(
                                userId,
                                rawCode
                        )
                );
    }

    private boolean codeMatches(
            UUID userId,
            String rawCode,
            String storedHash
    ) {
        byte[] storedHashBytes;

        try {
            storedHashBytes =
                    HexFormat.of()
                            .parseHex(
                                    storedHash
                            );
        } catch (IllegalArgumentException exception) {
            return false;
        }

        return MessageDigest.isEqual(
                calculateHash(
                        userId,
                        rawCode
                ),
                storedHashBytes
        );
    }

    private byte[] calculateHash(
            UUID userId,
            String rawCode
    ) {
        String value =
                HMAC_DOMAIN
                        + userId
                        + ":"
                        + rawCode;

        try {
            Mac mac =
                    Mac.getInstance(
                            HMAC_ALGORITHM
                    );

            mac.init(
                    new SecretKeySpec(
                            pepper,
                            HMAC_ALGORITHM
                    )
            );

            return mac.doFinal(
                    value.getBytes(
                            StandardCharsets.UTF_8
                    )
            );

        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(
                    "Unable to calculate "
                            + "password reset code hash",
                    exception
            );
        }
    }

    private void enforceMinimumResponseDuration(
            long startedAtNanos
    ) {
        long minimumNanos =
                minimumResponseDuration
                        .toNanos();

        long elapsedNanos =
                System.nanoTime()
                        - startedAtNanos;

        long remainingNanos =
                minimumNanos
                        - elapsedNanos;

        if (remainingNanos <= 0) {
            return;
        }

        long milliseconds =
                remainingNanos
                        / 1_000_000L;

        int nanoseconds =
                (int) (
                        remainingNanos
                                % 1_000_000L
                );

        try {
            Thread.sleep(
                    milliseconds,
                    nanoseconds
            );
        } catch (InterruptedException exception) {
            Thread.currentThread()
                    .interrupt();
        }
    }

    private String normaliseEmail(
            String email
    ) {
        return email
                .trim()
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private static byte[] decodePepper(
            String configuredPepper
    ) {
        if (
                configuredPepper == null
                        || configuredPepper.isBlank()
        ) {
            throw new IllegalStateException(
                    "PASSWORD_RESET_PEPPER "
                            + "must be configured"
            );
        }

        byte[] decoded;

        try {
            decoded =
                    Base64.getDecoder()
                            .decode(
                                    configuredPepper.strip()
                            );

        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException(
                    "PASSWORD_RESET_PEPPER "
                            + "must be valid Base64",
                    exception
            );
        }

        if (
                decoded.length
                        < MINIMUM_PEPPER_BYTES
        ) {
            throw new IllegalStateException(
                    "PASSWORD_RESET_PEPPER "
                            + "must contain at least 32 bytes"
            );
        }

        return decoded;
    }

    private static Duration requirePositive(
            Duration value,
            String name
    ) {
        if (
                value == null
                        || value.isZero()
                        || value.isNegative()
        ) {
            throw new IllegalStateException(
                    "Password reset "
                            + name
                            + " must be positive"
            );
        }

        return value;
    }

    private static int requirePositive(
            int value,
            String name
    ) {
        if (value <= 0) {
            throw new IllegalStateException(
                    "Password reset "
                            + name
                            + " must be positive"
            );
        }

        return value;
    }

    private record PasswordChangedNotification(
            UUID userId,
            String recipientEmail,
            Instant changedAt
    ) {
    }
}