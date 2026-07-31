package com.applymate.backend.reminder;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ReminderNotFoundException
        extends RuntimeException {

    public ReminderNotFoundException() {
        super("Reminder was not found");
    }
}