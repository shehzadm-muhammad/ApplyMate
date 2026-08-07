package com.applymate.backend.security;

import java.time.Instant;

public record AccessTokenGrant(
        String accessToken,
        String tokenType,
        Instant expiresAt
) {
}