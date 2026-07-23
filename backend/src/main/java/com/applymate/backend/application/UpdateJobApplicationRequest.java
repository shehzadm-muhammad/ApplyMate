package com.applymate.backend.application;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateJobApplicationRequest(

        @Size(max = 2000)
        String jobUrl,

        @NotBlank(message = "Company is required")
        @Size(max = 200)
        String company,

        @NotBlank(message = "Job title is required")
        @Size(max = 200)
        String jobTitle,

        @Size(max = 200)
        String location,

        @Size(max = 200)
        String salary,

        @NotNull(message = "Status is required")
        ApplicationStatus status,

        String notes,
        String jobDescription,
        String requiredSkills,
        String benefits,

        @Size(max = 200)
        String recruiter,

        LocalDate applicationDeadline
) {
}