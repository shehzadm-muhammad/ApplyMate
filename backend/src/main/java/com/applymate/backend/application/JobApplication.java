package com.applymate.backend.application;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "job_url", nullable = false, columnDefinition = "TEXT")
    private String jobUrl;

    @Column(nullable = false, length = 200)
    private String company;

    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false, length = 200)
    private String salary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Column(
            name = "job_description",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String jobDescription;

    @Column(
            name = "required_skills",
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String requiredSkills;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String benefits;

    @Column(nullable = false, length = 200)
    private String recruiter;

    @Column(name = "application_deadline")
    private LocalDate applicationDeadline;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected JobApplication() {
        // Required by JPA.
    }

    public JobApplication(
            UUID userId,
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
            LocalDate applicationDeadline
    ) {
        this.userId = userId;
        this.jobUrl = jobUrl;
        this.company = company;
        this.jobTitle = jobTitle;
        this.location = location;
        this.salary = salary;
        this.status = status;
        this.notes = notes;
        this.jobDescription = jobDescription;
        this.requiredSkills = requiredSkills;
        this.benefits = benefits;
        this.recruiter = recruiter;
        this.applicationDeadline = applicationDeadline;
    }

    @PrePersist
    void initialiseTimestamps() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getJobUrl() {
        return jobUrl;
    }

    public String getCompany() {
        return company;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getLocation() {
        return location;
    }

    public String getSalary() {
        return salary;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public String getBenefits() {
        return benefits;
    }

    public String getRecruiter() {
        return recruiter;
    }

    public LocalDate getApplicationDeadline() {
        return applicationDeadline;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}