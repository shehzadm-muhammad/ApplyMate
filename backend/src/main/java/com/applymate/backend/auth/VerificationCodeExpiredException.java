package com.applymate.backend.auth;

public class VerificationCodeExpiredException
        extends RuntimeException {

    public VerificationCodeExpiredException() {
        super("Verification code has expired");
    }
}