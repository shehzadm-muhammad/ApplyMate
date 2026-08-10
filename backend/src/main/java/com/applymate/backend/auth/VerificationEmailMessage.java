package com.applymate.backend.auth;

import java.time.Instant;
import java.util.UUID;

public record VerificationEmailMessage(
        UUID userId,
        String recipientEmail,
        String rawCode,
        Instant expiresAt,
        Instant issuedAt
) {
}