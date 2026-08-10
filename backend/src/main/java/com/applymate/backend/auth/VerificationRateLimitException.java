package com.applymate.backend.auth;

public class VerificationRateLimitException
        extends RuntimeException {

    private final long retryAfterSeconds;

    public VerificationRateLimitException(
            long retryAfterSeconds
    ) {
        super(
                "Too many verification codes requested. "
                        + "Try again later."
        );

        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
}