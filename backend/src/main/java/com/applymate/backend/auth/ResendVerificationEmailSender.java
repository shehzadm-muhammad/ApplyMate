package com.applymate.backend.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
@ConditionalOnProperty(
        name = "app.email.provider",
        havingValue = "resend"
)
public class ResendVerificationEmailSender
        implements VerificationEmailSender {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    ResendVerificationEmailSender.class
            );

    private static final String RESEND_BASE_URL =
            "https://api.resend.com";

    private final RestClient restClient;
    private final String from;

    @Autowired
    public ResendVerificationEmailSender(
            @Value("${app.email.resend.api-key:}")
            String apiKey,

            @Value("${app.email.from:}")
            String from,

            @Value("${app.email.resend.connect-timeout:PT5S}")
            Duration connectTimeout,

            @Value("${app.email.resend.read-timeout:PT10S}")
            Duration readTimeout
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "RESEND_API_KEY must be configured "
                            + "when EMAIL_PROVIDER=resend"
            );
        }

        if (from == null || from.isBlank()) {
            throw new IllegalStateException(
                    "EMAIL_FROM must be configured "
                            + "when EMAIL_PROVIDER=resend"
            );
        }

        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(
                connectTimeout
        );

        requestFactory.setReadTimeout(
                readTimeout
        );

        this.restClient =
                RestClient.builder()
                        .baseUrl(RESEND_BASE_URL)
                        .defaultHeader(
                                HttpHeaders.AUTHORIZATION,
                                "Bearer " + apiKey
                        )
                        .requestFactory(requestFactory)
                        .build();

        this.from = from;
    }

    ResendVerificationEmailSender(
            RestClient restClient,
            String from
    ) {
        this.restClient = restClient;
        this.from = from;
    }

    @Override
    public void sendVerificationCode(
            VerificationEmailMessage message
    ) {
        Map<String, Object> requestBody =
                createRequestBody(message);

        try {
            restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(
                            "Idempotency-Key",
                            createIdempotencyKey(message)
                    )
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();

        } catch (
                RestClientResponseException exception
        ) {
            LOGGER.warn(
                    "Verification email provider returned "
                            + "HTTP status {}",
                    exception.getStatusCode().value()
            );

            throw new EmailDeliveryException(
                    "Verification email delivery failed",
                    exception
            );

        } catch (RestClientException exception) {
            LOGGER.warn(
                    "Verification email provider request failed"
            );

            throw new EmailDeliveryException(
                    "Verification email delivery failed",
                    exception
            );
        }
    }

    private Map<String, Object> createRequestBody(
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

        return Map.of(
                "from",
                from,

                "to",
                List.of(message.recipientEmail()),

                "subject",
                "Verify your ApplyMate email",

                "text",
                text,

                "html",
                html
        );
    }

    private String createIdempotencyKey(
            VerificationEmailMessage message
    ) {
        return "applymate_verification_"
                + message.userId()
                        .toString()
                        .replace("-", "")
                + "_"
                + message.issuedAt().toEpochMilli();
    }
}