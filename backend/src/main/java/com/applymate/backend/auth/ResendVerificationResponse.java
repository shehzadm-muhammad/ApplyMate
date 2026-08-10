package com.applymate.backend.auth;

import java.time.Instant;

public record ResendVerificationResponse(
        String message,
        Instant verificationExpiresAt,
        Instant resendAvailableAt
) {

    private static final String GENERIC_MESSAGE =
            "If verification is required for this email, "
                    + "a verification code will be sent when allowed.";

    public static ResendVerificationResponse accepted() {
        return new ResendVerificationResponse(
                GENERIC_MESSAGE,
                null,
                null
        );
    }

    public static ResendVerificationResponse sent(
            IssuedEmailVerificationCode verification
    ) {
        return new ResendVerificationResponse(
                GENERIC_MESSAGE,
                verification.expiresAt(),
                verification.resendAvailableAt()
        );
    }
}