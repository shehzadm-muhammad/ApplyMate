package com.applymate.backend.application.jobimport;

public class JobImportException extends RuntimeException {

    public enum Reason {
        INVALID_URL,
        UNSAFE_URL,
        UNSUPPORTED_SITE,
        TIMEOUT,
        RESPONSE_TOO_LARGE,
        UNSUPPORTED_CONTENT,
        EXTRACTION_FAILED,
        RATE_LIMITED,
        UNAVAILABLE,
        TOO_MANY_REDIRECTS
    }

    private final Reason reason;
    private final Long retryAfterSeconds;

    public JobImportException(Reason reason) {
        this(reason, null);
    }

    public JobImportException(
            Reason reason,
            Long retryAfterSeconds
    ) {
        super(messageFor(reason));

        this.reason = reason;
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public Reason getReason() {
        return reason;
    }

    public Long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }

    private static String messageFor(Reason reason) {
        return switch (reason) {
            case INVALID_URL ->
                    "Enter a valid public job URL.";

            case UNSAFE_URL ->
                    "This URL cannot be imported.";

            case UNSUPPORTED_SITE ->
                    "This site isn't supported for automatic import.";

            case TIMEOUT ->
                    "The job page took too long to respond. Please try again.";

            case RESPONSE_TOO_LARGE ->
                    "This job page is too large to import.";

            case UNSUPPORTED_CONTENT ->
                    "This URL does not appear to be a supported job page.";

            case EXTRACTION_FAILED ->
                    "We couldn't automatically import this job. "
                            + "You can still enter the details manually.";

            case RATE_LIMITED ->
                    "Too many import attempts. Please try again shortly.";

            case UNAVAILABLE, TOO_MANY_REDIRECTS ->
                    "The job page is unavailable or could not be reached.";
        };
    }
}