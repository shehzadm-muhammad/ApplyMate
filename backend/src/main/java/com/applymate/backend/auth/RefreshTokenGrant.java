package com.applymate.backend.auth;

import java.time.Instant;
import java.util.UUID;

public record RefreshTokenGrant(
        String refreshToken,
        Instant expiresAt,
        UUID userId
) {
}