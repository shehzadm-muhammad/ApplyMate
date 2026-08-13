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
public class ResendEmailClient {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(
                    ResendEmailClient.class
            );

    private static final String RESEND_BASE_URL =
            "https://api.resend.com";

    private final RestClient restClient;
    private final String from;

    @Autowired
    public ResendEmailClient(
            @Value("${app.email.resend.api-key:}")
            String apiKey,

            @Value("${app.email.from:}")
            String from,

            @Value("${app.email.resend.connect-timeout:PT5S}")
            Duration connectTimeout,

            @Value("${app.email.resend.read-timeout:PT10S}")
            Duration readTimeout
    ) {
        String normalisedApiKey =
                normaliseApiKey(apiKey);

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
                                "Bearer " + normalisedApiKey
                        )
                        .requestFactory(requestFactory)
                        .build();

        this.from = from.strip();
    }

    ResendEmailClient(
            RestClient restClient,
            String from
    ) {
        this.restClient = restClient;
        this.from = from;
    }

    public void send(
            String recipientEmail,
            String subject,
            String text,
            String html,
            String idempotencyKey
    ) {
        Map<String, Object> requestBody =
                Map.of(
                        "from",
                        from,
                        "to",
                        List.of(recipientEmail),
                        "subject",
                        subject,
                        "text",
                        text,
                        "html",
                        html
                );

        try {
            restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(
                            "Idempotency-Key",
                            idempotencyKey
                    )
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();

        } catch (
                RestClientResponseException exception
        ) {
            LOGGER.warn(
                    "Transactional email provider returned "
                            + "HTTP status {}",
                    exception.getStatusCode().value()
            );

            throw new EmailDeliveryException(
                    "Transactional email delivery failed",
                    exception
            );

        } catch (RestClientException exception) {
            LOGGER.warn(
                    "Transactional email provider request failed"
            );

            throw new EmailDeliveryException(
                    "Transactional email delivery failed",
                    exception
            );

        } catch (IllegalArgumentException exception) {
            LOGGER.warn(
                    "Transactional email provider request "
                            + "could not be created"
            );

            throw new EmailDeliveryException(
                    "Transactional email delivery failed"
            );
        }
    }

    static String normaliseApiKey(
            String apiKey
    ) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "RESEND_API_KEY must be configured "
                            + "when EMAIL_PROVIDER=resend"
            );
        }

        String normalisedApiKey =
                apiKey.strip();

        boolean containsInvalidCharacters =
                normalisedApiKey
                        .chars()
                        .anyMatch(character ->
                                Character.isWhitespace(character)
                                        || Character.isISOControl(
                                        character
                                )
                        );

        if (containsInvalidCharacters) {
            throw new IllegalStateException(
                    "RESEND_API_KEY contains invalid characters"
            );
        }

        return normalisedApiKey;
    }
}