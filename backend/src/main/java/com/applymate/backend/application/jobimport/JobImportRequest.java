package com.applymate.backend.application.jobimport;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record JobImportRequest(

        @NotBlank(message = "Job URL is required")
        @Size(
                max = 2000,
                message = "Job URL must not exceed 2000 characters"
        )
        String url
) {
}