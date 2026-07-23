package com.applymate.backend.application;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record JobApplicationResponse(
        UUID id,
        String jobUrl,
        String company,
        String jobTitle,
        String location,
        String salary,
        ApplicationStatus status,
        String notes,
        String jobDescription,
        String requiredSkills,
        String benefits,
        String recruiter,
        LocalDate applicationDeadline,
        Instant createdAt,
        Instant updatedAt
) {

    public static JobApplicationResponse from(
            JobApplication application
    ) {
        return new JobApplicationResponse(
                application.getId(),
                application.getJobUrl(),
                application.getCompany(),
                application.getJobTitle(),
                application.getLocation(),
                application.getSalary(),
                application.getStatus(),
                application.getNotes(),
                application.getJobDescription(),
                application.getRequiredSkills(),
                application.getBenefits(),
                application.getRecruiter(),
                application.getApplicationDeadline(),
                application.getCreatedAt(),
                application.getUpdatedAt()
        );
    }
}