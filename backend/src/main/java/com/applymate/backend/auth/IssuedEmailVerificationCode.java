package com.applymate.backend.auth;

import java.time.Instant;

public record IssuedEmailVerificationCode(
        String rawCode,
        Instant issuedAt,
        Instant expiresAt,
        Instant resendAvailableAt
) {
}