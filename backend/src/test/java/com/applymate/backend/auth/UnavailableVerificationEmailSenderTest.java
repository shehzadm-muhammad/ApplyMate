package com.applymate.backend.auth;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;

class UnavailableVerificationEmailSenderTest {

    @Test
    void shouldFailSafelyWhenEmailDeliveryIsUnavailable() {
        UnavailableVerificationEmailSender sender =
                new UnavailableVerificationEmailSender();

        VerificationEmailMessage message =
                new VerificationEmailMessage(
                        UUID.randomUUID(),
                        "test@example.com",
                        "123456",
                        Instant.parse(
                                "2026-08-09T18:10:00Z"
                        ),
                        Instant.parse(
                                "2026-08-09T18:00:00Z"
                        )
                );

        assertThrows(
                EmailDeliveryException.class,
                () -> sender.sendVerificationCode(message)
        );
    }
}