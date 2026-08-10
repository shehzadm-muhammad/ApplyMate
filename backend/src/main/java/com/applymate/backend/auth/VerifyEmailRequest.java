package com.applymate.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VerifyEmailRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(
                max = 320,
                message = "Email must not exceed 320 characters"
        )
        String email,

        @NotBlank(message = "Verification code is required")
        @Pattern(
                regexp = "\\d{6}",
                message = "Verification code must contain exactly 6 digits"
        )
        String code
) {
}