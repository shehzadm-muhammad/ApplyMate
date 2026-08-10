package com.applymate.backend.auth;

public class IncorrectVerificationCodeException
        extends RuntimeException {

    public IncorrectVerificationCodeException() {
        super("Verification code is incorrect");
    }
}