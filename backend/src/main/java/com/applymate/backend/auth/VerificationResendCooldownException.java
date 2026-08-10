package com.applymate.backend.auth;

public class VerificationResendCooldownException
        extends RuntimeException {

    private final long retryAfterSeconds;

    public VerificationResendCooldownException(
            long retryAfterSeconds
    ) {
        super(
                "Please wait before requesting another "
                        + "verification code"
        );

        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}