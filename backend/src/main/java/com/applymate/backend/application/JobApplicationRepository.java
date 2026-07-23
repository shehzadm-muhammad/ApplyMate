package com.applymate.backend.application;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, UUID> {

    List<JobApplication> findAllByUserIdOrderByCreatedAtDesc(
            UUID userId
    );

    Optional<JobApplication> findByIdAndUserId(
            UUID id,
            UUID userId
    );
}