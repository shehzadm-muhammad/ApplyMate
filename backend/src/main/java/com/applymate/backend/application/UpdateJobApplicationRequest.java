package com.applymate.backend.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateJobApplicationRequest(

        @Size(
                max = 2000,
                message = "Job URL must not exceed 2000 characters"
        )
        @Pattern(
                regexp = "^$|^https?://[^\\s]+$",
                message = "Job URL must start with http:// or https://"
        )
        String jobUrl,

        @NotBlank(message = "Company is required")
        @Size(
                max = 200,
                message = "Company must not exceed 200 characters"
        )
        String company,

        @NotBlank(message = "Job title is required")
        @Size(
                max = 200,
                message = "Job title must not exceed 200 characters"
        )
        String jobTitle,

        @Size(
                max = 200,
                message = "Location must not exceed 200 characters"
        )
        String location,

        @Size(
                max = 200,
                message = "Salary must not exceed 200 characters"
        )
        String salary,

        @NotNull(message = "Status is required")
        ApplicationStatus status,

        @Size(
                max = 5000,
                message = "Notes must not exceed 5000 characters"
        )
        String notes,

        @Size(
                max = 20000,
                message = "Job description must not exceed 20000 characters"
        )
        String jobDescription,

        @Size(
                max = 10000,
                message = "Required skills must not exceed 10000 characters"
        )
        String requiredSkills,

        @Size(
                max = 10000,
                message = "Benefits must not exceed 10000 characters"
        )
        String benefits,

        @Size(
                max = 200,
                message = "Recruiter must not exceed 200 characters"
        )
        String recruiter,

        LocalDate applicationDeadline
) {
}