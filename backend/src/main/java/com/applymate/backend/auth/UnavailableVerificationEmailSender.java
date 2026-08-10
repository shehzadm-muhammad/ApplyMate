package com.applymate.backend.auth;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        name = "app.email.provider",
        havingValue = "disabled",
        matchIfMissing = true
)
public class UnavailableVerificationEmailSender
        implements VerificationEmailSender {

    @Override
    public void sendVerificationCode(
            VerificationEmailMessage message
    ) {
        throw new EmailDeliveryException(
                "Verification email delivery is unavailable"
        );
    }
}