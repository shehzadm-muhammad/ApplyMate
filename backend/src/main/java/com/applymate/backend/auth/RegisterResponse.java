package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;

import java.time.Instant;
import java.util.UUID;

public record RegisterResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Instant createdAt,
        boolean verificationRequired,
        Instant verificationExpiresAt,
        Instant resendAvailableAt,
        boolean verificationEmailSent
) {

    public static RegisterResponse from(
            AppUser user,
            IssuedEmailVerificationCode verification,
            boolean verificationEmailSent
    ) {
        return new RegisterResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getCreatedAt(),
                !user.isEmailVerified(),
                verification.expiresAt(),
                verification.resendAvailableAt(),
                verificationEmailSent
        );
    }
}