package com.applymate.backend.auth;

public class EmailVerificationRequiredException
        extends RuntimeException {

    public EmailVerificationRequiredException() {
        super("Email verification is required");
    }
}