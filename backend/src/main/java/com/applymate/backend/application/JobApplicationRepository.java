package com.applymate.backend.application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobApplicationRepository
        extends JpaRepository<JobApplication, UUID>,
        JpaSpecificationExecutor<JobApplication> {

    List<JobApplication> findAllByUserIdOrderByCreatedAtDesc(
            UUID userId
    );

    Optional<JobApplication> findByIdAndUserId(
            UUID id,
            UUID userId
    );

    @Query("""
            SELECT application.status AS status,
                   COUNT(application) AS count
            FROM JobApplication application
            WHERE application.userId = :userId
            GROUP BY application.status
            """)
    List<ApplicationStatusCount> countByStatusForUser(
            @Param("userId") UUID userId
    );
}