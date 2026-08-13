package com.applymate.backend.auth;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
@ConditionalOnProperty(
        name = "app.email.provider",
        havingValue = "resend"
)
public class ResendVerificationEmailSender
        implements VerificationEmailSender {

    private final ResendEmailClient resendEmailClient;

    public ResendVerificationEmailSender(
            ResendEmailClient resendEmailClient
    ) {
        this.resendEmailClient =
                resendEmailClient;
    }

    @Override
    public void sendVerificationCode(
            VerificationEmailMessage message
    ) {
        long expiryMinutes =
                Math.max(
                        1,
                        Duration.between(
                                        message.issuedAt(),
                                        message.expiresAt()
                                )
                                .toMinutes()
                );

        String text = """
                Your ApplyMate verification code is: %s

                This code expires in %d minutes.

                If you did not create an ApplyMate account, \
                you can ignore this email.
                """.formatted(
                message.rawCode(),
                expiryMinutes
        );

        String html = """
                <p>Your ApplyMate verification code is:</p>
                <p>
                  <strong style="font-size:24px;letter-spacing:4px;">
                    %s
                  </strong>
                </p>
                <p>This code expires in %d minutes.</p>
                <p>
                  If you did not create an ApplyMate account,
                  you can ignore this email.
                </p>
                """.formatted(
                message.rawCode(),
                expiryMinutes
        );

        try {
            resendEmailClient.send(
                    message.recipientEmail(),
                    "Verify your ApplyMate email",
                    text,
                    html,
                    createIdempotencyKey(message)
            );
        } catch (EmailDeliveryException ignored) {
                throw new EmailDeliveryException(
                        "Verification email delivery failed"
                );
        }
    }

    private String createIdempotencyKey(
            VerificationEmailMessage message
    ) {
        return "applymate_verification_"
                + message.userId()
                        .toString()
                        .replace("-", "")
                + "_"
                + message.issuedAt()
                        .toEpochMilli();
    }
}