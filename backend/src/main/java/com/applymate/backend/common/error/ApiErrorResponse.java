package com.applymate.backend.common.error;

import java.time.Instant;
import java.util.Map;

public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        Map<String, String> fieldErrors,
        Long retryAfterSeconds
) {

    public ApiErrorResponse(
            Instant timestamp,
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        this(
                timestamp,
                status,
                error,
                null,
                message,
                path,
                fieldErrors,
                null
        );
    }
}