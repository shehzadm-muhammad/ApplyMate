package com.applymate.backend.auth.passwordreset;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        @Size(
                max = 320,
                message = "Email must not exceed 320 characters"
        )
        String email

) {
}