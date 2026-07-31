package com.applymate.backend.reminder;

import java.time.Instant;
import java.util.UUID;

public record ReminderResponse(

        UUID id,

        String title,

        String company,

        ReminderType type,

        Instant dueAt,

        String notes,

        boolean completed,

        Instant createdAt,

        Instant updatedAt
) {

    public static ReminderResponse from(Reminder reminder) {
        return new ReminderResponse(
                reminder.getId(),
                reminder.getTitle(),
                reminder.getCompany(),
                reminder.getType(),
                reminder.getDueAt(),
                reminder.getNotes(),
                reminder.isCompleted(),
                reminder.getCreatedAt(),
                reminder.getUpdatedAt()
        );
    }
}