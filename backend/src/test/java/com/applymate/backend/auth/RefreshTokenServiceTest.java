package com.applymate.backend.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    private static final Duration TOKEN_TTL =
            Duration.ofDays(30);

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        RefreshTokenProperties properties =
                new RefreshTokenProperties(TOKEN_TTL);

        refreshTokenService = new RefreshTokenService(
                refreshTokenRepository,
                properties
        );
    }

    @Test
    void shouldIssueRandomHashedRefreshToken() {
        UUID userId = UUID.randomUUID();
        Instant beforeIssue = Instant.now();

        RefreshTokenGrant grant =
                refreshTokenService.issue(userId);

        Instant afterIssue = Instant.now();

        ArgumentCaptor<RefreshToken> tokenCaptor =
                ArgumentCaptor.forClass(RefreshToken.class);

        verify(refreshTokenRepository)
                .save(tokenCaptor.capture());

        RefreshToken storedToken = tokenCaptor.getValue();

        assertEquals(userId, grant.userId());
        assertEquals(userId, storedToken.getUserId());
        assertNotNull(storedToken.getFamilyId());

        assertFalse(grant.refreshToken().isBlank());
        assertEquals(43, grant.refreshToken().length());

        assertEquals(64, storedToken.getTokenHash().length());
        assertNotEquals(
                grant.refreshToken(),
                storedToken.getTokenHash()
        );

        assertEquals(
                hashToken(grant.refreshToken()),
                storedToken.getTokenHash()
        );

        assertEquals(
                grant.expiresAt(),
                storedToken.getExpiresAt()
        );

        assertFalse(
                grant.expiresAt().isBefore(
                        beforeIssue.plus(TOKEN_TTL)
                )
        );

        assertFalse(
                grant.expiresAt().isAfter(
                        afterIssue.plus(TOKEN_TTL)
                )
        );
    }

    @Test
    void shouldRotateValidTokenAndStartNewInactivityPeriod() {
        String rawToken = "valid-refresh-token";
        UUID userId = UUID.randomUUID();
        UUID familyId = UUID.randomUUID();

        RefreshToken currentToken = new RefreshToken(
                userId,
                familyId,
                hashToken(rawToken),
                Instant.now().plus(Duration.ofDays(5))
        );

        when(
                refreshTokenRepository.findByTokenHash(
                        hashToken(rawToken)
                )
        ).thenReturn(Optional.of(currentToken));

        Instant beforeRotation = Instant.now();

        RefreshTokenGrant grant =
                refreshTokenService.rotate(rawToken);

        Instant afterRotation = Instant.now();

        ArgumentCaptor<RefreshToken> tokenCaptor =
                ArgumentCaptor.forClass(RefreshToken.class);

        verify(refreshTokenRepository, times(2))
                .save(tokenCaptor.capture());

        List<RefreshToken> savedTokens =
                tokenCaptor.getAllValues();

        RefreshToken replacementToken =
                savedTokens.get(1);

        assertTrue(currentToken.isRevoked());

        assertEquals(userId, replacementToken.getUserId());
        assertEquals(familyId, replacementToken.getFamilyId());

        assertEquals(
                hashToken(grant.refreshToken()),
                replacementToken.getTokenHash()
        );

        assertFalse(
                grant.expiresAt().isBefore(
                        beforeRotation.plus(TOKEN_TTL)
                )
        );

        assertFalse(
                grant.expiresAt().isAfter(
                        afterRotation.plus(TOKEN_TTL)
                )
        );
    }

    @Test
    void shouldRevokeActiveFamilyWhenOldTokenIsReused() {
        String rawToken = "previously-used-token";
        UUID userId = UUID.randomUUID();
        UUID familyId = UUID.randomUUID();
        Instant now = Instant.now();

        RefreshToken reusedToken = new RefreshToken(
                userId,
                familyId,
                hashToken(rawToken),
                now.plus(Duration.ofDays(5))
        );

        reusedToken.revoke(now.minusSeconds(1));

        RefreshToken activeReplacement = new RefreshToken(
                userId,
                familyId,
                hashToken("active-replacement-token"),
                now.plus(Duration.ofDays(5))
        );

        when(
                refreshTokenRepository.findByTokenHash(
                        hashToken(rawToken)
                )
        ).thenReturn(Optional.of(reusedToken));

        when(
                refreshTokenRepository
                        .findAllByFamilyIdAndRevokedAtIsNull(
                                familyId
                        )
        ).thenReturn(List.of(activeReplacement));

        assertThrows(
                InvalidRefreshTokenException.class,
                () -> refreshTokenService.rotate(rawToken)
        );

        assertTrue(activeReplacement.isRevoked());

        verify(
                refreshTokenRepository,
                never()
        ).save(any(RefreshToken.class));
    }

    @Test
    void shouldRejectAndRevokeExpiredToken() {
        String rawToken = "expired-refresh-token";

        RefreshToken expiredToken = new RefreshToken(
                UUID.randomUUID(),
                UUID.randomUUID(),
                hashToken(rawToken),
                Instant.now().minusSeconds(1)
        );

        when(
                refreshTokenRepository.findByTokenHash(
                        hashToken(rawToken)
                )
        ).thenReturn(Optional.of(expiredToken));

        assertThrows(
                InvalidRefreshTokenException.class,
                () -> refreshTokenService.rotate(rawToken)
        );

        assertTrue(expiredToken.isRevoked());

        verify(refreshTokenRepository)
                .save(expiredToken);
    }

    @Test
    void shouldRejectBlankTokenWithoutDatabaseLookup() {
        assertThrows(
                InvalidRefreshTokenException.class,
                () -> refreshTokenService.rotate(" ")
        );

        verifyNoInteractions(refreshTokenRepository);
    }

    private static String hashToken(String rawToken) {
        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }
}