package com.applymate.backend.application.jobimport;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
public class JobImportController {

    private final JobImportService jobImportService;

    public JobImportController(
            JobImportService jobImportService
    ) {
        this.jobImportService =
                jobImportService;
    }

    @PostMapping("/import-preview")
    public JobImportPreview importPreview(
            Principal principal,
            @Valid @RequestBody
            JobImportRequest request
    ) {
        UUID userId =
                UUID.fromString(
                        principal.getName()
                );

        return jobImportService.importPreview(
                userId,
                request
        );
    }
}