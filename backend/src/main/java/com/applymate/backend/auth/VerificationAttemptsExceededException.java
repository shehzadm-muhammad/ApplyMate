package com.applymate.backend.auth;

public class VerificationAttemptsExceededException
        extends RuntimeException {

    public VerificationAttemptsExceededException() {
        super(
                "Too many incorrect verification attempts. "
                        + "Request a new code."
        );
    }
}