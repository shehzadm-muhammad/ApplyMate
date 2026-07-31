package com.applymate.backend.reminder;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReminderController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReminderControllerTest {

    private static final UUID USER_ID = UUID.fromString(
            "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
    );

    private static final UUID REMINDER_ID = UUID.fromString(
            "f4b85d6c-68b4-4997-bfd9-ab919b56fa50"
    );

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ReminderService reminderService;

    @Test
    void shouldCreateReminder() throws Exception {
        when(reminderService.create(
                eq(USER_ID),
                any(CreateReminderRequest.class)
        )).thenReturn(testResponse());

        mockMvc.perform(post("/api/v1/reminders")
                        .principal(() -> USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Java Interview",
                                  "company": "Example Bank",
                                  "type": "INTERVIEW",
                                  "dueAt": "2026-08-10T10:30:00Z",
                                  "notes": "Prepare Spring Boot questions"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id")
                        .value(REMINDER_ID.toString()))
                .andExpect(jsonPath("$.title")
                        .value("Java Interview"))
                .andExpect(jsonPath("$.company")
                        .value("Example Bank"))
                .andExpect(jsonPath("$.type")
                        .value("INTERVIEW"))
                .andExpect(jsonPath("$.dueAt")
                        .value("2026-08-10T10:30:00Z"))
                .andExpect(jsonPath("$.notes")
                        .value("Prepare Spring Boot questions"))
                .andExpect(jsonPath("$.completed")
                        .value(false));
    }

    @Test
    void shouldReturnRemindersForCurrentUser()
            throws Exception {

        when(reminderService.findAllForUser(USER_ID))
                .thenReturn(List.of(testResponse()));

        mockMvc.perform(get("/api/v1/reminders")
                        .principal(() -> USER_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id")
                        .value(REMINDER_ID.toString()))
                .andExpect(jsonPath("$[0].title")
                        .value("Java Interview"))
                .andExpect(jsonPath("$[0].company")
                        .value("Example Bank"))
                .andExpect(jsonPath("$[0].type")
                        .value("INTERVIEW"))
                .andExpect(jsonPath("$[0].completed")
                        .value(false));
    }

    @Test
    void shouldReturnOneOwnedReminder()
            throws Exception {

        when(reminderService.findById(
                USER_ID,
                REMINDER_ID
        )).thenReturn(testResponse());

        mockMvc.perform(get(
                        "/api/v1/reminders/{reminderId}",
                        REMINDER_ID
                )
                        .principal(() -> USER_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id")
                        .value(REMINDER_ID.toString()))
                .andExpect(jsonPath("$.title")
                        .value("Java Interview"))
                .andExpect(jsonPath("$.company")
                        .value("Example Bank"))
                .andExpect(jsonPath("$.type")
                        .value("INTERVIEW"));
    }

    @Test
    void shouldUpdateOwnedReminder()
            throws Exception {

        when(reminderService.update(
                eq(USER_ID),
                eq(REMINDER_ID),
                any(UpdateReminderRequest.class)
        )).thenReturn(updatedResponse());

        mockMvc.perform(put(
                        "/api/v1/reminders/{reminderId}",
                        REMINDER_ID
                )
                        .principal(() -> USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Final Interview",
                                  "company": "Updated Bank",
                                  "type": "INTERVIEW",
                                  "dueAt": "2026-08-12T14:00:00Z",
                                  "notes": "Bring portfolio",
                                  "completed": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id")
                        .value(REMINDER_ID.toString()))
                .andExpect(jsonPath("$.title")
                        .value("Final Interview"))
                .andExpect(jsonPath("$.company")
                        .value("Updated Bank"))
                .andExpect(jsonPath("$.type")
                        .value("INTERVIEW"))
                .andExpect(jsonPath("$.dueAt")
                        .value("2026-08-12T14:00:00Z"))
                .andExpect(jsonPath("$.notes")
                        .value("Bring portfolio"))
                .andExpect(jsonPath("$.completed")
                        .value(true));
    }

    @Test
    void shouldDeleteOwnedReminder()
            throws Exception {

        mockMvc.perform(delete(
                        "/api/v1/reminders/{reminderId}",
                        REMINDER_ID
                )
                        .principal(() -> USER_ID.toString()))
                .andExpect(status().isNoContent());

        verify(reminderService).delete(
                USER_ID,
                REMINDER_ID
        );
    }

    @Test
    void shouldReturnNotFoundForUnavailableReminder()
            throws Exception {

        when(reminderService.findById(
                USER_ID,
                REMINDER_ID
        )).thenThrow(new ReminderNotFoundException());

        mockMvc.perform(get(
                        "/api/v1/reminders/{reminderId}",
                        REMINDER_ID
                )
                        .principal(() -> USER_ID.toString()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error")
                        .value("Not Found"))
                .andExpect(jsonPath("$.message")
                        .value("Reminder was not found"));
    }

    @Test
    void shouldRejectInvalidReminderRequest()
            throws Exception {

        mockMvc.perform(post("/api/v1/reminders")
                        .principal(() -> USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "",
                                  "company": "",
                                  "type": null,
                                  "dueAt": null,
                                  "notes": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error")
                        .value("Bad Request"))
                .andExpect(jsonPath("$.message")
                        .value("Request validation failed"))
                .andExpect(jsonPath("$.path")
                        .value("/api/v1/reminders"))
                .andExpect(jsonPath("$.fieldErrors.title")
                        .value("must not be blank"))
                .andExpect(jsonPath("$.fieldErrors.company")
                        .value("must not be blank"))
                .andExpect(jsonPath("$.fieldErrors.type")
                        .value("must not be null"))
                .andExpect(jsonPath("$.fieldErrors.dueAt")
                        .value("must not be null"))
                .andExpect(jsonPath("$.fieldErrors.notes")
                        .value("must not be blank"));
    }

    private ReminderResponse testResponse() {
        return new ReminderResponse(
                REMINDER_ID,
                "Java Interview",
                "Example Bank",
                ReminderType.INTERVIEW,
                Instant.parse("2026-08-10T10:30:00Z"),
                "Prepare Spring Boot questions",
                false,
                Instant.parse("2026-07-31T10:00:00Z"),
                Instant.parse("2026-07-31T10:00:00Z")
        );
    }

    private ReminderResponse updatedResponse() {
        return new ReminderResponse(
                REMINDER_ID,
                "Final Interview",
                "Updated Bank",
                ReminderType.INTERVIEW,
                Instant.parse("2026-08-12T14:00:00Z"),
                "Bring portfolio",
                true,
                Instant.parse("2026-07-31T10:00:00Z"),
                Instant.parse("2026-07-31T11:00:00Z")
        );
    }
}