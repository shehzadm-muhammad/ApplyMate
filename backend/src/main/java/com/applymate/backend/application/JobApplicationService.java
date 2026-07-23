package com.applymate.backend.application;

import com.applymate.backend.user.AppUserRepository;
import com.applymate.backend.user.UserNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

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
    public List<JobApplicationResponse> findAllForUser(
            UUID userId
    ) {
        verifyUserExists(userId);

        return applicationRepository
                .findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(JobApplicationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> findAllForUser(
            UUID userId,
            ApplicationStatus status,
            String search
    ) {
        verifyUserExists(userId);

        Specification<JobApplication> specification =
                JobApplicationSpecifications.belongsTo(userId);

        if (status != null) {
            specification = specification.and(
                    JobApplicationSpecifications.hasStatus(status)
            );
        }

        if (search != null && !search.isBlank()) {
            specification = specification.and(
                    JobApplicationSpecifications.containsSearch(search)
            );
        }

        Sort newestFirst = Sort.by(
                Sort.Direction.DESC,
                "createdAt"
        );

        return applicationRepository
                .findAll(specification, newestFirst)
                .stream()
                .map(JobApplicationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse findById(
            UUID userId,
            UUID applicationId
    ) {
        JobApplication application =
                findOwnedApplication(userId, applicationId);

        return JobApplicationResponse.from(application);
    }

    @Transactional
    public JobApplicationResponse update(
            UUID userId,
            UUID applicationId,
            UpdateJobApplicationRequest request
    ) {
        JobApplication application =
                findOwnedApplication(userId, applicationId);

        application.update(
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

        JobApplication updated =
                applicationRepository.saveAndFlush(application);

        return JobApplicationResponse.from(updated);
    }

    @Transactional(readOnly = true)
    public ApplicationSummaryResponse getSummary(UUID userId) {
        verifyUserExists(userId);

        return ApplicationSummaryResponse.from(
                applicationRepository.countByStatusForUser(userId)
        );
    }

    @Transactional
    public void delete(
            UUID userId,
            UUID applicationId
    ) {
        JobApplication application =
                findOwnedApplication(userId, applicationId);

        applicationRepository.delete(application);
    }

    private JobApplication findOwnedApplication(
            UUID userId,
            UUID applicationId
    ) {
        return applicationRepository
                .findByIdAndUserId(applicationId, userId)
                .orElseThrow(
                        JobApplicationNotFoundException::new
                );
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