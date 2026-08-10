package com.applymate.backend.auth;

public record EmailVerificationResponse(
        boolean verified,
        String message
) {

    public static EmailVerificationResponse success() {
        return new EmailVerificationResponse(
                true,
                "Email verified successfully"
        );
    }
}