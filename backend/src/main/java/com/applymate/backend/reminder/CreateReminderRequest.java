package com.applymate.backend.reminder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateReminderRequest(

        @NotBlank(message = "Title is required")
        @Size(
                max = 200,
                message = "Title must not exceed 200 characters"
        )
        String title,

        @Size(
                max = 200,
                message = "Company must not exceed 200 characters"
        )
        String company,

        @NotNull(message = "Type is required")
        ReminderType type,

        @NotNull(message = "Due date and time are required")
        Instant dueAt,

        String notes
) {
}