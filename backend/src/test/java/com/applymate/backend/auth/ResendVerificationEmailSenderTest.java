package com.applymate.backend.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class ResendVerificationEmailSenderTest {

    private static final UUID USER_ID =
            UUID.fromString(
                    "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
            );

    private static final Instant ISSUED_AT =
            Instant.parse(
                    "2026-08-09T18:00:00Z"
            );

    private MockRestServiceServer server;

    private ResendVerificationEmailSender sender;

    private VerificationEmailMessage message;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder =
                RestClient.builder()
                        .baseUrl(
                                "https://api.resend.com"
                        )
                        .defaultHeader(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer test-api-key"
                        );

        server =
                MockRestServiceServer
                        .bindTo(builder)
                        .build();

        ResendEmailClient resendEmailClient =
                new ResendEmailClient(
                        builder.build(),
                        "ApplyMate <verify@example.com>"
                );

        sender =
                new ResendVerificationEmailSender(
                        resendEmailClient
                );

        message =
                new VerificationEmailMessage(
                        USER_ID,
                        "recipient@example.com",
                        "123456",
                        ISSUED_AT.plusSeconds(600),
                        ISSUED_AT
                );
    }

    @Test
    void shouldSendVerificationEmail() {
        server.expect(
                        requestTo(
                                "https://api.resend.com/emails"
                        )
                )
                .andExpect(
                        method(HttpMethod.POST)
                )
                .andExpect(
                        header(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer test-api-key"
                        )
                )
                .andExpect(
                        header(
                                "Idempotency-Key",
                                expectedIdempotencyKey()
                        )
                )
                .andExpect(
                        jsonPath("$.from")
                                .value(
                                        "ApplyMate "
                                                + "<verify@example.com>"
                                )
                )
                .andExpect(
                        jsonPath("$.to[0]")
                                .value(
                                        "recipient@example.com"
                                )
                )
                .andExpect(
                        jsonPath("$.subject")
                                .value(
                                        "Verify your ApplyMate email"
                                )
                )
                .andExpect(
                        jsonPath("$.text")
                                .value(
                                        org.hamcrest.Matchers
                                                .containsString(
                                                        "123456"
                                                )
                                )
                )
                .andExpect(
                        jsonPath("$.html")
                                .value(
                                        org.hamcrest.Matchers
                                                .containsString(
                                                        "123456"
                                                )
                                )
                )
                .andRespond(
                        withSuccess(
                                """
                                {
                                  "id": "test-email-id"
                                }
                                """,
                                MediaType.APPLICATION_JSON
                        )
                );

        sender.sendVerificationCode(message);

        server.verify();
    }

    @Test
void shouldNormaliseOuterWhitespaceFromApiKey() {
    String normalisedApiKey =
            ResendEmailClient
                    .normaliseApiKey(
                            " \r\nre_test_key\t "
                    );

    assertEquals(
            "re_test_key",
            normalisedApiKey
    );
}

@Test
void shouldRejectEmbeddedWhitespaceWithoutEchoingSecret() {
    String simulatedSecret =
            "re_test_key\nhidden-part";

    IllegalStateException exception =
            assertThrows(
                    IllegalStateException.class,
                    () ->
                            ResendEmailClient
                                    .normaliseApiKey(
                                            simulatedSecret
                                    )
            );

    assertEquals(
            "RESEND_API_KEY contains invalid characters",
            exception.getMessage()
    );

    assertFalse(
            exception.getMessage()
                    .contains(simulatedSecret)
    );
}

@Test
void shouldHideIllegalHeaderDetailsWhenRequestCreationFails() {
    String simulatedSecret =
            "re_secret_should_not_escape";

    RestClient failingRestClient =
            RestClient.builder()
                    .baseUrl(
                            "https://api.resend.com"
                    )
                    .requestInterceptor(
                            (request, body, execution) -> {
                                throw new IllegalArgumentException(
                                        "Illegal character(s) "
                                                + "in message header value: "
                                                + "Bearer "
                                                + simulatedSecret
                                );
                            }
                    )
                    .build();

    ResendEmailClient failingClient =
        new ResendEmailClient(
                failingRestClient,
                "ApplyMate <verify@example.com>"
        );

ResendVerificationEmailSender failingSender =
        new ResendVerificationEmailSender(
                failingClient
        );

    EmailDeliveryException exception =
            assertThrows(
                    EmailDeliveryException.class,
                    () ->
                            failingSender
                                    .sendVerificationCode(
                                            message
                                    )
            );

    assertEquals(
            "Verification email delivery failed",
            exception.getMessage()
    );

    assertNull(
            exception.getCause()
    );

    assertFalse(
            exception.toString()
                    .contains(simulatedSecret)
    );
}

    @Test
    void shouldFailSafelyForClientError() {
        expectFailure(
                HttpStatus.BAD_REQUEST
        );
    }

    @Test
    void shouldFailSafelyForRateLimit() {
        expectFailure(
                HttpStatus.TOO_MANY_REQUESTS
        );
    }

    @Test
    void shouldFailSafelyForProviderError() {
        expectFailure(
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    @Test
    void shouldFailSafelyForTransportError() {
        server.expect(
                        requestTo(
                                "https://api.resend.com/emails"
                        )
                )
                .andRespond(request -> {
                    throw new IOException(
                            "Simulated transport failure"
                    );
                });

        assertThrows(
                EmailDeliveryException.class,
                () -> sender.sendVerificationCode(message)
        );

        server.verify();
    }

    private void expectFailure(
            HttpStatus status
    ) {
        server.expect(
                        requestTo(
                                "https://api.resend.com/emails"
                        )
                )
                .andRespond(
                        withStatus(status)
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .body(
                                        """
                                        {
                                          "message": "simulated error"
                                        }
                                        """
                                )
                );

        assertThrows(
                EmailDeliveryException.class,
                () -> sender.sendVerificationCode(message)
        );

        server.verify();
    }

    private String expectedIdempotencyKey() {
        return "applymate_verification_"
                + USER_ID
                        .toString()
                        .replace("-", "")
                + "_"
                + ISSUED_AT.toEpochMilli();
    }
}