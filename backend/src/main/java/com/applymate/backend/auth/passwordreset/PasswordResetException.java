package com.applymate.backend.auth.passwordreset;

public class PasswordResetException
        extends RuntimeException {

    public PasswordResetException() {
        super(
                "Password reset code is invalid or expired. "
                        + "Request a new code."
        );
    }
}