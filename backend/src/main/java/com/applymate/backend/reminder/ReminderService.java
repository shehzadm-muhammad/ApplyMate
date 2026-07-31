package com.applymate.backend.reminder;

import com.applymate.backend.user.AppUserRepository;
import com.applymate.backend.user.UserNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final AppUserRepository appUserRepository;

    public ReminderService(
            ReminderRepository reminderRepository,
            AppUserRepository appUserRepository
    ) {
        this.reminderRepository = reminderRepository;
        this.appUserRepository = appUserRepository;
    }

    @Transactional
    public ReminderResponse create(
            UUID userId,
            CreateReminderRequest request
    ) {
        verifyUserExists(userId);

        Reminder reminder = new Reminder(
                userId,
                request.title().trim(),
                request.company().trim(),
                request.type(),
                request.dueAt(),
                clean(request.notes())
        );

        Reminder saved =
                reminderRepository.saveAndFlush(reminder);

        return ReminderResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ReminderResponse> findAllForUser(
            UUID userId
    ) {
        verifyUserExists(userId);

        return reminderRepository
                .findAllByUserIdOrderByDueAtAsc(userId)
                .stream()
                .map(ReminderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReminderResponse findById(
            UUID userId,
            UUID reminderId
    ) {
        Reminder reminder =
                findOwnedReminder(userId, reminderId);

        return ReminderResponse.from(reminder);
    }

    @Transactional
    public ReminderResponse update(
            UUID userId,
            UUID reminderId,
            UpdateReminderRequest request
    ) {
        Reminder reminder =
                findOwnedReminder(userId, reminderId);

        reminder.update(
                request.title().trim(),
                request.company().trim(),
                request.type(),
                request.dueAt(),
                clean(request.notes()),
                request.completed()
        );

        Reminder updated =
                reminderRepository.saveAndFlush(reminder);

        return ReminderResponse.from(updated);
    }

    @Transactional
    public void delete(
            UUID userId,
            UUID reminderId
    ) {
        Reminder reminder =
                findOwnedReminder(userId, reminderId);

        reminderRepository.delete(reminder);
    }

    private Reminder findOwnedReminder(
            UUID userId,
            UUID reminderId
    ) {
        return reminderRepository
                .findByIdAndUserId(reminderId, userId)
                .orElseThrow(
                        ReminderNotFoundException::new
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