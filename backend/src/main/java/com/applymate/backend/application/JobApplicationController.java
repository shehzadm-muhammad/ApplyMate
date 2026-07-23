package com.applymate.backend.application;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
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
        UUID userId = UUID.fromString(principal.getName());

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
        UUID userId = UUID.fromString(principal.getName());

        return applicationService.findAllForUser(userId);
    }
}