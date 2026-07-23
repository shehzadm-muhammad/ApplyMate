package com.applymate.backend.application;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
public class JobApplicationController {

    private final JobApplicationService applicationService;

    public JobApplicationController(
            JobApplicationService applicationService
    ) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(
            Principal principal,
            @Valid @RequestBody CreateJobApplicationRequest request
    ) {
        UUID userId = getUserId(principal);

        JobApplicationResponse response =
                applicationService.create(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public List<JobApplicationResponse> findAll(
            Principal principal
    ) {
        UUID userId = getUserId(principal);

        return applicationService.findAllForUser(userId);
    }

    @GetMapping("/{applicationId}")
    public JobApplicationResponse findById(
            Principal principal,
            @PathVariable UUID applicationId
    ) {
        UUID userId = getUserId(principal);

        return applicationService.findById(
                userId,
                applicationId
        );
    }

    @PutMapping("/{applicationId}")
    public JobApplicationResponse update(
            Principal principal,
            @PathVariable UUID applicationId,
            @Valid @RequestBody UpdateJobApplicationRequest request
    ) {
        UUID userId = getUserId(principal);

        return applicationService.update(
                userId,
                applicationId,
                request
        );
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> delete(
            Principal principal,
            @PathVariable UUID applicationId
    ) {
        UUID userId = getUserId(principal);

        applicationService.delete(userId, applicationId);

        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(Principal principal) {
        return UUID.fromString(principal.getName());
    }
}