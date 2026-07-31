package com.applymate.backend.reminder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateReminderRequest(

        @NotBlank
        @Size(max = 200)
        String title,

        @NotBlank
        @Size(max = 200)
        String company,

        @NotNull
        ReminderType type,

        @NotNull
        Instant dueAt,

        @NotBlank
        String notes
) {
}