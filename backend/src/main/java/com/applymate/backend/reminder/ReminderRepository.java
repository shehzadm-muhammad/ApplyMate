package com.applymate.backend.reminder;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReminderRepository
        extends JpaRepository<Reminder, UUID> {

    List<Reminder> findAllByUserIdOrderByDueAtAsc(
            UUID userId
    );

    Optional<Reminder> findByIdAndUserId(
            UUID id,
            UUID userId
    );
}