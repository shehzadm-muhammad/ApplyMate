package com.applymate.backend.reminder;

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
import java.util.UUID;

@Entity
@Table(name = "reminders")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(
            name = "user_id",
            nullable = false,
            updatable = false
    )
    private UUID userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200)
    private String company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReminderType type;

    @Column(name = "due_at", nullable = false)
    private Instant dueAt;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private boolean completed;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Reminder() {
        // Required by JPA.
    }

    public Reminder(
            UUID userId,
            String title,
            String company,
            ReminderType type,
            Instant dueAt,
            String notes
    ) {
        this.userId = userId;
        this.title = title;
        this.company = company;
        this.type = type;
        this.dueAt = dueAt;
        this.notes = notes;
        this.completed = false;
    }

    public void update(
            String title,
            String company,
            ReminderType type,
            Instant dueAt,
            String notes,
            boolean completed
    ) {
        this.title = title;
        this.company = company;
        this.type = type;
        this.dueAt = dueAt;
        this.notes = notes;
        this.completed = completed;
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

    public String getTitle() {
        return title;
    }

    public String getCompany() {
        return company;
    }

    public ReminderType getType() {
        return type;
    }

    public Instant getDueAt() {
        return dueAt;
    }

    public String getNotes() {
        return notes;
    }

    public boolean isCompleted() {
        return completed;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}