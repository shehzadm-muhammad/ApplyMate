package com.applymate.backend.application.jobimport;

import com.applymate.backend.common.error.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static com.applymate.backend.application.jobimport.JobImportException.Reason.RATE_LIMITED;
import static com.applymate.backend.application.jobimport.JobImportException.Reason.UNSAFE_URL;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JobImportController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class JobImportControllerTest {

    private static final UUID USER_ID =
            UUID.fromString(
                    "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
            );

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JobImportService jobImportService;

    @Test
    void returnsPreviewForAuthenticatedPrincipal()
            throws Exception {

        JobImportPreview preview =
                new JobImportPreview(
                        "https://jobs.example.com/123",
                        "Example Bank",
                        "Java Developer",
                        "Birmingham",
                        "GBP 35,000",
                        "Build backend services.",
                        "Java, Spring Boot",
                        "Hybrid working",
                        "",
                        LocalDate.of(
                                2026,
                                9,
                                15
                        ),
                        List.of()
                );

        when(jobImportService.importPreview(
                eq(USER_ID),
                any(JobImportRequest.class)
        )).thenReturn(preview);

        mockMvc.perform(
                        post(
                                "/api/v1/applications/import-preview"
                        )
                                .principal(
                                        () -> USER_ID.toString()
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "url": "https://jobs.example.com/123"
                                        }
                                        """)
                )
                .andExpect(status().isOk())
                .andExpect(
                        jsonPath("$.jobUrl")
                                .value(
                                        "https://jobs.example.com/123"
                                )
                )
                .andExpect(
                        jsonPath("$.company")
                                .value("Example Bank")
                )
                .andExpect(
                        jsonPath("$.jobTitle")
                                .value("Java Developer")
                );

        verify(jobImportService)
                .importPreview(
                        eq(USER_ID),
                        any(JobImportRequest.class)
                );
    }

    @Test
    void rejectsBlankUrlBeforeServiceCall()
            throws Exception {

        mockMvc.perform(
                        post(
                                "/api/v1/applications/import-preview"
                        )
                                .principal(
                                        () -> USER_ID.toString()
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "url": ""
                                        }
                                        """)
                )
                .andExpect(
                        status().isBadRequest()
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Request validation failed"
                                )
                )
                .andExpect(
                        jsonPath("$.fieldErrors.url")
                                .value(
                                        "Job URL is required"
                                )
                );

        verify(
                jobImportService,
                never()
        ).importPreview(
                eq(USER_ID),
                any(JobImportRequest.class)
        );
    }

    @Test
    void returnsSafeStructuredErrorForUnsafeUrl()
            throws Exception {

        when(jobImportService.importPreview(
                eq(USER_ID),
                any(JobImportRequest.class)
        )).thenThrow(
                new JobImportException(
                        UNSAFE_URL
                )
        );

        mockMvc.perform(
                        post(
                                "/api/v1/applications/import-preview"
                        )
                                .principal(
                                        () -> USER_ID.toString()
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "url": "http://127.0.0.1/admin?token=secret"
                                        }
                                        """)
                )
                .andExpect(
                        status().isBadRequest()
                )
                .andExpect(
                        jsonPath("$.code")
                                .value(
                                        "JOB_IMPORT_UNSUPPORTED_URL"
                                )
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "This URL cannot be imported."
                                )
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        not(
                                                containsString(
                                                        "token=secret"
                                                )
                                        )
                                )
                );
    }

    @Test
    void returnsRetryAfterForRateLimit()
            throws Exception {

        when(jobImportService.importPreview(
                eq(USER_ID),
                any(JobImportRequest.class)
        )).thenThrow(
                new JobImportException(
                        RATE_LIMITED,
                        321L
                )
        );

        mockMvc.perform(
                        post(
                                "/api/v1/applications/import-preview"
                        )
                                .principal(
                                        () -> USER_ID.toString()
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content("""
                                        {
                                          "url": "https://jobs.example.com/123"
                                        }
                                        """)
                )
                .andExpect(
                        status().isTooManyRequests()
                )
                .andExpect(
                        jsonPath("$.code")
                                .value(
                                        "JOB_IMPORT_RATE_LIMITED"
                                )
                )
                .andExpect(
                        jsonPath("$.retryAfterSeconds")
                                .value(321)
                )
                .andExpect(
                        header().string(
                                "Retry-After",
                                "321"
                        )
                );
    }
}