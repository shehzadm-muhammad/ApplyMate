package com.applymate.backend.application.jobimport;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static com.applymate.backend.application.jobimport.JobImportException.Reason.RATE_LIMITED;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class JobImportServiceTest {

    private static final UUID USER_ID =
            UUID.fromString(
                    "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
            );

    private static final UUID SECOND_USER_ID =
            UUID.fromString(
                    "f4b85d6c-68b4-4997-bfd9-ab919b56fa50"
            );

    private SafeJobPageFetcher fetcher;
    private JobPageExtractor extractor;
    private MutableClock clock;
    private JobImportService service;

    private SafeJobPageFetcher.FetchedPage page;
    private JobImportPreview preview;

    @BeforeEach
    void setUp() {
        fetcher =
                mock(SafeJobPageFetcher.class);

        extractor =
                mock(JobPageExtractor.class);

        clock =
                new MutableClock(
                        Instant.parse(
                                "2026-08-17T10:00:00Z"
                        )
                );

        service =
                new JobImportService(
                        fetcher,
                        extractor,
                        clock
                );

        page =
                new SafeJobPageFetcher.FetchedPage(
                        URI.create(
                                "https://jobs.example.com/123"
                        ),
                        "jobs.example.com",
                        "<html></html>"
                );

        preview =
                new JobImportPreview(
                        "https://jobs.example.com/123",
                        "Example Bank",
                        "Java Developer",
                        "Birmingham",
                        "GBP 35,000",
                        "Build backend services.",
                        "Java, Spring Boot",
                        "Hybrid working",
                        "",
                        LocalDate.of(
                                2026,
                                9,
                                15
                        ),
                        List.of()
                );

        when(fetcher.fetch(
                "https://jobs.example.com/123"
        )).thenReturn(page);

        when(extractor.extract(page))
                .thenReturn(preview);
    }

    @Test
    void fetchesAndExtractsPreview() {
        JobImportPreview result =
                service.importPreview(
                        USER_ID,
                        request()
                );

        assertSame(
                preview,
                result
        );

        verify(fetcher).fetch(
                "https://jobs.example.com/123"
        );

        verify(extractor).extract(page);
    }

    @Test
    void rateLimitsEleventhAttemptWithinWindow() {
        for (int attempt = 0;
             attempt < 10;
             attempt++) {

            service.importPreview(
                    USER_ID,
                    request()
            );
        }

        JobImportException exception =
                assertThrows(
                        JobImportException.class,
                        () -> service.importPreview(
                                USER_ID,
                                request()
                        )
                );

        assertEquals(
                RATE_LIMITED,
                exception.getReason()
        );

        assertEquals(
                600L,
                exception.getRetryAfterSeconds()
        );

        verify(
                fetcher,
                times(10)
        ).fetch(
                "https://jobs.example.com/123"
        );
    }

    @Test
    void allowsAnotherAttemptWhenWindowExpires() {
        for (int attempt = 0;
             attempt < 10;
             attempt++) {

            service.importPreview(
                    USER_ID,
                    request()
            );
        }

        clock.advance(
                Duration.ofMinutes(10)
        );

        JobImportPreview result =
                service.importPreview(
                        USER_ID,
                        request()
                );

        assertSame(
                preview,
                result
        );

        verify(
                fetcher,
                times(11)
        ).fetch(
                "https://jobs.example.com/123"
        );
    }

    @Test
    void keepsRateLimitsSeparatePerUser() {
        for (int attempt = 0;
             attempt < 10;
             attempt++) {

            service.importPreview(
                    USER_ID,
                    request()
            );
        }

        JobImportPreview result =
                service.importPreview(
                        SECOND_USER_ID,
                        request()
                );

        assertSame(
                preview,
                result
        );

        assertThrows(
                JobImportException.class,
                () -> service.importPreview(
                        USER_ID,
                        request()
                )
        );

        verify(
                fetcher,
                times(11)
        ).fetch(
                "https://jobs.example.com/123"
        );
    }

    @Test
    void cleansExpiredUserBuckets() {
        service.importPreview(
                USER_ID,
                request()
        );

        assertEquals(
                1,
                service.trackedUserCount()
        );

        clock.advance(
                Duration.ofMinutes(11)
        );

        service.importPreview(
                SECOND_USER_ID,
                request()
        );

        assertEquals(
                1,
                service.trackedUserCount()
        );
    }

    private JobImportRequest request() {
        return new JobImportRequest(
                "https://jobs.example.com/123"
        );
    }

    private static final class MutableClock
            extends Clock {

        private Instant instant;

        private MutableClock(
                Instant instant
        ) {
            this.instant = instant;
        }

        void advance(
                Duration duration
        ) {
            instant =
                    instant.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(
                ZoneId zone
        ) {
            return this;
        }

        @Override
        public Instant instant() {
            return instant;
        }
    }
}