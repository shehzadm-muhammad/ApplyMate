package com.applymate.backend.reminder;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(
            ReminderService reminderService
    ) {
        this.reminderService = reminderService;
    }

    @PostMapping
    public ResponseEntity<ReminderResponse> create(
            Principal principal,
            @Valid @RequestBody CreateReminderRequest request
    ) {
        UUID userId = getUserId(principal);

        ReminderResponse response =
                reminderService.create(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public List<ReminderResponse> findAll(
            Principal principal
    ) {
        UUID userId = getUserId(principal);

        return reminderService.findAllForUser(userId);
    }

    @GetMapping("/{reminderId}")
    public ReminderResponse findById(
            Principal principal,
            @PathVariable UUID reminderId
    ) {
        UUID userId = getUserId(principal);

        return reminderService.findById(
                userId,
                reminderId
        );
    }

    @PutMapping("/{reminderId}")
    public ReminderResponse update(
            Principal principal,
            @PathVariable UUID reminderId,
            @Valid @RequestBody UpdateReminderRequest request
    ) {
        UUID userId = getUserId(principal);

        return reminderService.update(
                userId,
                reminderId,
                request
        );
    }

    @DeleteMapping("/{reminderId}")
    public ResponseEntity<Void> delete(
            Principal principal,
            @PathVariable UUID reminderId
    ) {
        UUID userId = getUserId(principal);

        reminderService.delete(
                userId,
                reminderId
        );

        return ResponseEntity.noContent().build();
    }

    private UUID getUserId(Principal principal) {
        return UUID.fromString(principal.getName());
    }
}