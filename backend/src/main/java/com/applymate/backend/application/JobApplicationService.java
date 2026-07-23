package com.applymate.backend.application;

import com.applymate.backend.user.AppUserRepository;
import com.applymate.backend.user.UserNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final AppUserRepository appUserRepository;

    public JobApplicationService(
            JobApplicationRepository applicationRepository,
            AppUserRepository appUserRepository
    ) {
        this.applicationRepository = applicationRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public JobApplicationResponse create(
            UUID userId,
            CreateJobApplicationRequest request
    ) {
        verifyUserExists(userId);

        JobApplication application = new JobApplication(
                userId,
                clean(request.jobUrl()),
                request.company().trim(),
                request.jobTitle().trim(),
                clean(request.location()),
                clean(request.salary()),
                request.status(),
                clean(request.notes()),
                clean(request.jobDescription()),
                clean(request.requiredSkills()),
                clean(request.benefits()),
                clean(request.recruiter()),
                request.applicationDeadline()
        );

        JobApplication saved =
                applicationRepository.saveAndFlush(application);

        return JobApplicationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> findAllForUser(UUID userId) {
        verifyUserExists(userId);

        return applicationRepository
                .findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(JobApplicationResponse::from)
                .toList();
    }

    private void verifyUserExists(UUID userId) {
        if (!appUserRepository.existsById(userId)) {
            throw new UserNotFoundException();
        }
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }
}