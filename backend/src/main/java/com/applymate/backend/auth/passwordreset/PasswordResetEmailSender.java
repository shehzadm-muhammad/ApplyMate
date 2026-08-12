package com.applymate.backend.auth.passwordreset;

import com.applymate.backend.auth.EmailDeliveryException;
import com.applymate.backend.auth.ResendEmailClient;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Component
public class PasswordResetEmailSender {

    private final Optional<ResendEmailClient> resendEmailClient;

    public PasswordResetEmailSender(
            Optional<ResendEmailClient> resendEmailClient
    ) {
        this.resendEmailClient = resendEmailClient;
    }

    public void sendResetCode(
            UUID userId,
            String recipientEmail,
            String rawCode,
            Instant issuedAt,
            Instant expiresAt
    ) {
        long expiryMinutes =
                Math.max(
                        1,
                        Duration.between(
                                        issuedAt,
                                        expiresAt
                                )
                                .toMinutes()
                );

        String text = """
                Your ApplyMate password reset code is: %s

                This code expires in %d minutes.

                If you did not request a password reset, \
                you can safely ignore this email.

                ApplyMate
                https://applymate.website
                """.formatted(
                rawCode,
                expiryMinutes
        );

        String html = """
                <p>Your ApplyMate password reset code is:</p>
                <p>
                  <strong style="font-size:24px;letter-spacing:4px;">
                    %s
                  </strong>
                </p>
                <p>This code expires in %d minutes.</p>
                <p>
                  If you did not request a password reset,
                  you can safely ignore this email.
                </p>
                <p>
                  ApplyMate &mdash; applymate.website
                </p>
                """.formatted(
                rawCode,
                expiryMinutes
        );

        send(
                recipientEmail,
                "Reset your ApplyMate password",
                text,
                html,
                "applymate_password_reset_"
                        + compactUserId(userId)
                        + "_"
                        + issuedAt.toEpochMilli()
        );
    }

    public void sendPasswordChanged(
            UUID userId,
            String recipientEmail,
            Instant changedAt
    ) {
        String text = """
                Your ApplyMate password was changed successfully.

                If you made this change, no further action is needed.

                If you did not change your password, request another \
                password reset immediately.

                ApplyMate
                https://applymate.website
                """;

        String html = """
                <p>Your ApplyMate password was changed successfully.</p>
                <p>
                  If you made this change,
                  no further action is needed.
                </p>
                <p>
                  If you did not change your password,
                  request another password reset immediately.
                </p>
                <p>
                  ApplyMate &mdash; applymate.website
                </p>
                """;

        send(
                recipientEmail,
                "Your ApplyMate password was changed",
                text,
                html,
                "applymate_password_changed_"
                        + compactUserId(userId)
                        + "_"
                        + changedAt.toEpochMilli()
        );
    }

    private void send(
            String recipientEmail,
            String subject,
            String text,
            String html,
            String idempotencyKey
    ) {
        ResendEmailClient client =
                resendEmailClient.orElseThrow(
                        () -> new EmailDeliveryException(
                                "Password reset email delivery "
                                        + "is unavailable"
                        )
                );

        try {
            client.send(
                    recipientEmail,
                    subject,
                    text,
                    html,
                    idempotencyKey
            );
        } catch (EmailDeliveryException ignored) {
            throw new EmailDeliveryException(
                    "Password reset email delivery failed"
            );
        }
    }

    private String compactUserId(
            UUID userId
    ) {
        return userId
                .toString()
                .replace("-", "");
    }
}