package com.applymate.backend.auth;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 32;
    private static final SecureRandom SECURE_RANDOM =
            new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;
    private final RefreshTokenProperties properties;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            RefreshTokenProperties properties
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.properties = properties;
    }

    @Transactional
    public RefreshTokenGrant issue(UUID userId) {
        return createToken(
                userId,
                UUID.randomUUID(),
                Instant.now()
        );
    }

    @Transactional(
            noRollbackFor = InvalidRefreshTokenException.class
    )
    public RefreshTokenGrant rotate(String rawToken) {
        validateRawToken(rawToken);

        Instant now = Instant.now();
        String tokenHash = hashToken(rawToken);

        RefreshToken currentToken = refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(InvalidRefreshTokenException::new);

        if (currentToken.isRevoked()) {
            revokeFamily(currentToken.getFamilyId(), now);
            throw new InvalidRefreshTokenException();
        }

        if (currentToken.isExpired(now)) {
            currentToken.revoke(now);
            refreshTokenRepository.save(currentToken);
            throw new InvalidRefreshTokenException();
        }

        currentToken.revoke(now);
        refreshTokenRepository.save(currentToken);

        return createToken(
                currentToken.getUserId(),
                currentToken.getFamilyId(),
                now
        );
    }

    @Transactional
    public void revokeSession(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        refreshTokenRepository
                .findByTokenHash(hashToken(rawToken))
                .ifPresent(token ->
                        revokeFamily(
                                token.getFamilyId(),
                                Instant.now()
                        )
                );
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        Instant now = Instant.now();

        refreshTokenRepository
                .findAllByUserIdAndRevokedAtIsNull(userId)
                .forEach(token -> token.revoke(now));
    }

    private RefreshTokenGrant createToken(
            UUID userId,
            UUID familyId,
            Instant now
    ) {
        String rawToken = generateRawToken();
        Instant expiresAt = now.plus(properties.ttl());

        RefreshToken refreshToken = new RefreshToken(
                userId,
                familyId,
                hashToken(rawToken),
                expiresAt
        );

        refreshTokenRepository.save(refreshToken);

        return new RefreshTokenGrant(
                rawToken,
                expiresAt,
                userId
        );
    }

    private void revokeFamily(
            UUID familyId,
            Instant revokedAt
    ) {
        refreshTokenRepository
                .findAllByFamilyIdAndRevokedAtIsNull(familyId)
                .forEach(token -> token.revoke(revokedAt));
    }

    private String generateRawToken() {
        byte[] tokenBytes = new byte[TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(tokenBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(tokenBytes);
    }

    private String hashToken(String rawToken) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 is unavailable",
                    exception
            );
        }
    }

    private void validateRawToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }
    }
}