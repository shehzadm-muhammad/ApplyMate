package com.applymate.backend.common.error;

import com.applymate.backend.application.JobApplicationNotFoundException;
import com.applymate.backend.auth.EmailAlreadyExistsException;
import com.applymate.backend.auth.EmailVerificationRequiredException;
import com.applymate.backend.auth.InvalidCredentialsException;
import com.applymate.backend.auth.InvalidRefreshTokenException;
import com.applymate.backend.reminder.ReminderNotFoundException;
import com.applymate.backend.user.UserNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.applymate.backend.auth.EmailDeliveryException;
import com.applymate.backend.auth.IncorrectVerificationCodeException;
import com.applymate.backend.auth.VerificationAttemptsExceededException;
import com.applymate.backend.auth.VerificationCodeExpiredException;
import com.applymate.backend.auth.VerificationRateLimitException;
import com.applymate.backend.auth.VerificationResendCooldownException;
import org.springframework.http.HttpHeaders;
import com.applymate.backend.auth.passwordreset.PasswordResetException;
import com.applymate.backend.application.jobimport.JobImportException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailAlreadyExists(
            EmailAlreadyExistsException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getMessage(),
                request,
                Map.of()
        );
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                exception.getMessage(),
                request,
                Map.of()
        );
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidRefreshToken(
            InvalidRefreshTokenException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                exception.getMessage(),
                request,
                Map.of()
        );
    }

    @ExceptionHandler(EmailVerificationRequiredException.class)
    public ResponseEntity<ApiErrorResponse>
            handleEmailVerificationRequired(
                    EmailVerificationRequiredException exception,
                    HttpServletRequest request
            ) {

        return buildResponse(
                HttpStatus.FORBIDDEN,
                "EMAIL_VERIFICATION_REQUIRED",
                exception.getMessage(),
                request,
                Map.of(),
                null
        );
    }

    @ExceptionHandler({
            UserNotFoundException.class,
            JobApplicationNotFoundException.class,
            ReminderNotFoundException.class
    })
    public ResponseEntity<ApiErrorResponse> handleNotFound(
            RuntimeException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getMessage(),
                request,
                Map.of()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        fieldErrors.putIfAbsent(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Request validation failed",
                request,
                fieldErrors
        );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        String message =
                "Invalid value for parameter '"
                        + exception.getName()
                        + "'";

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                message,
                request,
                Map.of()
        );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableRequest(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "Request body is invalid or malformed",
                request,
                Map.of()
        );
    }

    @ExceptionHandler(PasswordResetException.class)
        public ResponseEntity<ApiErrorResponse>
                handlePasswordReset(
                        PasswordResetException exception,
                        HttpServletRequest request
                ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "PASSWORD_RESET_CODE_INVALID_OR_EXPIRED",
                exception.getMessage(),
                request,
                Map.of(),
                null
        );
        }

        @ExceptionHandler(JobImportException.class)
    public ResponseEntity<ApiErrorResponse> handleJobImport(
            JobImportException exception,
            HttpServletRequest request
    ) {
        HttpStatus status;
        String code;

        switch (exception.getReason()) {
            case INVALID_URL -> {
                status = HttpStatus.BAD_REQUEST;
                code = "JOB_IMPORT_INVALID_URL";
            }

            case UNSAFE_URL -> {
                status = HttpStatus.BAD_REQUEST;
                code = "JOB_IMPORT_UNSUPPORTED_URL";
            }

            case UNSUPPORTED_SITE -> {
                status = HttpStatus.BAD_REQUEST;
                code = "JOB_IMPORT_UNSUPPORTED_SITE";
            }

            case TIMEOUT -> {
                status = HttpStatus.GATEWAY_TIMEOUT;
                code = "JOB_IMPORT_TIMEOUT";
            }

            case RESPONSE_TOO_LARGE -> {
                status = HttpStatus.BAD_REQUEST;
                code = "JOB_IMPORT_RESPONSE_TOO_LARGE";
            }

            case UNSUPPORTED_CONTENT -> {
                status = HttpStatus.BAD_REQUEST;
                code = "JOB_IMPORT_UNSUPPORTED_CONTENT";
            }

            case EXTRACTION_FAILED -> {
                status = HttpStatus.BAD_REQUEST;
                code = "JOB_IMPORT_EXTRACTION_FAILED";
            }

            case RATE_LIMITED -> {
                status = HttpStatus.TOO_MANY_REQUESTS;
                code = "JOB_IMPORT_RATE_LIMITED";
            }

            case UNAVAILABLE,
                 TOO_MANY_REDIRECTS -> {
                status = HttpStatus.BAD_GATEWAY;
                code = "JOB_IMPORT_UNAVAILABLE";
            }

            default -> {
                status = HttpStatus.BAD_GATEWAY;
                code = "JOB_IMPORT_UNAVAILABLE";
            }
        }

        return buildResponse(
                status,
                code,
                exception.getMessage(),
                request,
                Map.of(),
                exception.getRetryAfterSeconds()
        );
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedError(
            Exception exception,
            HttpServletRequest request
    ) {
        LOGGER.error(
                "Unexpected API error for {}",
                request.getRequestURI(),
                exception
        );

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred",
                request,
                Map.of()
        );
    }

    @ExceptionHandler(IncorrectVerificationCodeException.class)
public ResponseEntity<ApiErrorResponse>
        handleIncorrectVerificationCode(
                IncorrectVerificationCodeException exception,
                HttpServletRequest request
        ) {

    return buildResponse(
            HttpStatus.BAD_REQUEST,
            "VERIFICATION_CODE_INCORRECT",
            exception.getMessage(),
            request,
            Map.of(),
            null
    );
}

@ExceptionHandler(VerificationCodeExpiredException.class)
public ResponseEntity<ApiErrorResponse>
        handleVerificationCodeExpired(
                VerificationCodeExpiredException exception,
                HttpServletRequest request
        ) {

    return buildResponse(
            HttpStatus.GONE,
            "VERIFICATION_CODE_EXPIRED",
            exception.getMessage(),
            request,
            Map.of(),
            null
    );
}

@ExceptionHandler(VerificationAttemptsExceededException.class)
public ResponseEntity<ApiErrorResponse>
        handleVerificationAttemptsExceeded(
                VerificationAttemptsExceededException exception,
                HttpServletRequest request
        ) {

    return buildResponse(
            HttpStatus.TOO_MANY_REQUESTS,
            "VERIFICATION_ATTEMPTS_EXCEEDED",
            exception.getMessage(),
            request,
            Map.of(),
            null
    );
}

@ExceptionHandler(VerificationResendCooldownException.class)
public ResponseEntity<ApiErrorResponse>
        handleVerificationResendCooldown(
                VerificationResendCooldownException exception,
                HttpServletRequest request
        ) {

    return buildResponse(
            HttpStatus.TOO_MANY_REQUESTS,
            "VERIFICATION_RESEND_COOLDOWN",
            exception.getMessage(),
            request,
            Map.of(),
            exception.getRetryAfterSeconds()
    );
}

@ExceptionHandler(VerificationRateLimitException.class)
public ResponseEntity<ApiErrorResponse>
        handleVerificationRateLimit(
                VerificationRateLimitException exception,
                HttpServletRequest request
        ) {

    return buildResponse(
            HttpStatus.TOO_MANY_REQUESTS,
            "VERIFICATION_RATE_LIMITED",
            exception.getMessage(),
            request,
            Map.of(),
            exception.getRetryAfterSeconds()
    );
}

@ExceptionHandler(EmailDeliveryException.class)
public ResponseEntity<ApiErrorResponse>
        handleEmailDelivery(
                EmailDeliveryException exception,
                HttpServletRequest request
        ) {

    return buildResponse(
            HttpStatus.SERVICE_UNAVAILABLE,
            "VERIFICATION_EMAIL_UNAVAILABLE",
            "Verification email delivery is temporarily unavailable",
            request,
            Map.of(),
            null
    );
}

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                fieldErrors
        );

        return ResponseEntity
                .status(status)
                .body(response);
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request,
            Map<String, String> fieldErrors,
            Long retryAfterSeconds
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                request.getRequestURI(),
                fieldErrors,
                retryAfterSeconds
        );

        ResponseEntity.BodyBuilder responseBuilder =
        ResponseEntity.status(status);

if (retryAfterSeconds != null) {
    responseBuilder.header(
            HttpHeaders.RETRY_AFTER,
            Long.toString(retryAfterSeconds)
    );
}

return responseBuilder.body(response);
    }

}