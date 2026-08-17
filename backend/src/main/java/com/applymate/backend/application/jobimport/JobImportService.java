package com.applymate.backend.application.jobimport;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import static com.applymate.backend.application.jobimport.JobImportException.Reason.RATE_LIMITED;

@Service
public class JobImportService {

    static final int MAX_ATTEMPTS = 10;

    static final Duration RATE_LIMIT_WINDOW =
            Duration.ofMinutes(10);

    private final SafeJobPageFetcher fetcher;
    private final JobPageExtractor extractor;
    private final Clock clock;

    private final ConcurrentMap<UUID, RateBucket>
            rateBuckets =
            new ConcurrentHashMap<>();
    @Autowired
    public JobImportService(
            SafeJobPageFetcher fetcher,
            JobPageExtractor extractor
    ) {
        this(
                fetcher,
                extractor,
                Clock.systemUTC()
        );
    }

    JobImportService(
            SafeJobPageFetcher fetcher,
            JobPageExtractor extractor,
            Clock clock
    ) {
        this.fetcher =
                Objects.requireNonNull(fetcher);

        this.extractor =
                Objects.requireNonNull(extractor);

        this.clock =
                Objects.requireNonNull(clock);
    }

    public JobImportPreview importPreview(
            UUID userId,
            JobImportRequest request
    ) {
        Objects.requireNonNull(userId);
        Objects.requireNonNull(request);

        Instant now =
                clock.instant();

        cleanupExpiredBuckets(now);

        recordAttempt(
                userId,
                now
        );

        SafeJobPageFetcher.FetchedPage page =
                fetcher.fetch(
                        request.url()
                );

        return extractor.extract(page);
    }

    private void recordAttempt(
            UUID userId,
            Instant now
    ) {
        rateBuckets.compute(
                userId,
                (ignored, existingBucket) -> {

                    RateBucket bucket =
                            existingBucket == null
                                    ? new RateBucket()
                                    : existingBucket;

                    removeExpiredAttempts(
                            bucket,
                            now
                    );

                    if (bucket.attempts.size()
                            >= MAX_ATTEMPTS) {

                        Instant oldestAttempt =
                                bucket.attempts
                                        .peekFirst();

                        throw new JobImportException(
                                RATE_LIMITED,
                                retryAfterSeconds(
                                        oldestAttempt,
                                        now
                                )
                        );
                    }

                    bucket.attempts.addLast(now);

                    return bucket;
                }
        );
    }

    private void cleanupExpiredBuckets(
            Instant now
    ) {
        for (UUID userId :
                rateBuckets.keySet()) {

            rateBuckets.computeIfPresent(
                    userId,
                    (ignored, bucket) -> {

                        removeExpiredAttempts(
                                bucket,
                                now
                        );

                        if (bucket.attempts
                                .isEmpty()) {
                            return null;
                        }

                        return bucket;
                    }
            );
        }
    }

    private void removeExpiredAttempts(
            RateBucket bucket,
            Instant now
    ) {
        Instant cutoff =
                now.minus(
                        RATE_LIMIT_WINDOW
                );

        while (!bucket.attempts.isEmpty()
                && !bucket.attempts
                .peekFirst()
                .isAfter(cutoff)) {

            bucket.attempts.removeFirst();
        }
    }

    private long retryAfterSeconds(
            Instant oldestAttempt,
            Instant now
    ) {
        if (oldestAttempt == null) {
            return 1;
        }

        Instant availableAt =
                oldestAttempt.plus(
                        RATE_LIMIT_WINDOW
                );

        long remainingMillis =
                Duration.between(
                        now,
                        availableAt
                ).toMillis();

        if (remainingMillis <= 0) {
            return 1;
        }

        return Math.max(
                1,
                (remainingMillis + 999) / 1000
        );
    }

    int trackedUserCount() {
        return rateBuckets.size();
    }

    private static final class RateBucket {

        private final Deque<Instant>
                attempts =
                new ArrayDeque<>();
    }
}