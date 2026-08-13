package com.applymate.backend.auth.passwordreset;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "password_reset_challenges")
public class PasswordResetChallenge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "user_id",
            nullable = false,
            unique = true,
            updatable = false
    )
    private UUID userId;

    @Column(
            name = "code_hash",
            nullable = false,
            length = 64
    )
    private String codeHash;

    @Column(
            name = "expires_at",
            nullable = false
    )
    private Instant expiresAt;

    @Column(
            name = "failed_attempts",
            nullable = false
    )
    private int failedAttempts;

    @Column(
            name = "last_issued_at",
            nullable = false
    )
    private Instant lastIssuedAt;

    @Column(
            name = "issue_window_started_at",
            nullable = false
    )
    private Instant issueWindowStartedAt;

    @Column(
            name = "issue_count",
            nullable = false
    )
    private int issueCount;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private Instant updatedAt;

    protected PasswordResetChallenge() {
        // Required by JPA.
    }

    public PasswordResetChallenge(
            UUID userId,
            String codeHash,
            Instant expiresAt,
            Instant issuedAt
    ) {
        this.userId = userId;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.failedAttempts = 0;
        this.lastIssuedAt = issuedAt;
        this.issueWindowStartedAt = issuedAt;
        this.issueCount = 1;
    }

    @PrePersist
    void initialiseTimestamps() {
        Instant now = Instant.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }

    public boolean isExpired(
            Instant now
    ) {
        return !expiresAt.isAfter(now);
    }

    public void recordFailedAttempt() {
        failedAttempts++;
    }

    public void replaceCode(
            String newCodeHash,
            Instant newExpiresAt,
            Instant issuedAt,
            boolean startNewIssueWindow
    ) {
        codeHash = newCodeHash;
        expiresAt = newExpiresAt;
        failedAttempts = 0;
        lastIssuedAt = issuedAt;

        if (startNewIssueWindow) {
            issueWindowStartedAt = issuedAt;
            issueCount = 1;
        } else {
            issueCount++;
        }
    }

    public UUID getUserId() {
        return userId;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public int getFailedAttempts() {
        return failedAttempts;
    }

    public Instant getLastIssuedAt() {
        return lastIssuedAt;
    }

    public Instant getIssueWindowStartedAt() {
        return issueWindowStartedAt;
    }

    public int getIssueCount() {
        return issueCount;
    }
}