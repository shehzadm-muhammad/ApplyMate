package com.applymate.backend.auth;

public interface VerificationEmailSender {

    void sendVerificationCode(
            VerificationEmailMessage message
    );
}