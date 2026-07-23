package com.applymate.backend.application;

import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;
import java.util.UUID;

public final class JobApplicationSpecifications {

    private JobApplicationSpecifications() {
    }

    public static Specification<JobApplication> belongsTo(
            UUID userId
    ) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("userId"),
                        userId
                );
    }

    public static Specification<JobApplication> hasStatus(
            ApplicationStatus status
    ) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("status"),
                        status
                );
    }

    public static Specification<JobApplication> containsSearch(
            String search
    ) {
        String pattern = "%"
                + search.trim().toLowerCase(Locale.ROOT)
                + "%";

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.or(
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.<String>get("company")
                                ),
                                pattern
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.<String>get("jobTitle")
                                ),
                                pattern
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.<String>get("location")
                                ),
                                pattern
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.<String>get("recruiter")
                                ),
                                pattern
                        ),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(
                                        root.<String>get("requiredSkills")
                                ),
                                pattern
                        )
                );
    }
}