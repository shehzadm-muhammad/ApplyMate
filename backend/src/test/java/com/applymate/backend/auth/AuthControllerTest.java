package com.applymate.backend.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void shouldRegisterUser() throws Exception {
        UUID userId = UUID.fromString(
                "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
        );

        RegisterResponse response = new RegisterResponse(
                userId,
                "zaib.test@example.com",
                "Muhammad",
                "Shehzad",
                Instant.parse("2026-07-17T21:49:47Z")
        );

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Muhammad",
                                  "lastName": "Shehzad",
                                  "email": "zaib.test@example.com",
                                  "password": "ApplyMate123!"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email")
                        .value("zaib.test@example.com"))
                .andExpect(jsonPath("$.firstName").value("Muhammad"))
                .andExpect(jsonPath("$.lastName").value("Shehzad"));
    }

    @Test
    void shouldRejectInvalidRegistrationRequest() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "",
                                  "lastName": "",
                                  "email": "not-an-email",
                                  "password": "short"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnConflictWhenEmailAlreadyExists() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(
                        new EmailAlreadyExistsException(
                                "zaib.test@example.com"
                        )
                );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Muhammad",
                                  "lastName": "Shehzad",
                                  "email": "zaib.test@example.com",
                                  "password": "ApplyMate123!"
                                }
                                """))
                .andExpect(status().isConflict());
    }

    @Test
    void shouldLoginAndReturnAccessAndRefreshTokens() throws Exception {
        UUID userId = UUID.fromString(
                "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
        );

        LoginResponse response = new LoginResponse(
                "new-access-token",
                "Bearer",
                Instant.parse("2026-08-01T15:00:00Z"),
                "new-refresh-token",
                Instant.parse("2026-08-31T14:00:00Z"),
                userId,
                "zaib.test@example.com",
                "Muhammad",
                "Shehzad"
        );

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "zaib.test@example.com",
                                  "password": "ApplyMate123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken")
                        .value("new-access-token"))
                .andExpect(jsonPath("$.tokenType")
                        .value("Bearer"))
                .andExpect(jsonPath("$.expiresAt")
                        .value("2026-08-01T15:00:00Z"))
                .andExpect(jsonPath("$.refreshToken")
                        .value("new-refresh-token"))
                .andExpect(jsonPath("$.refreshExpiresAt")
                        .value("2026-08-31T14:00:00Z"))
                .andExpect(jsonPath("$.userId")
                        .value(userId.toString()))
                .andExpect(jsonPath("$.email")
                        .value("zaib.test@example.com"))
                .andExpect(jsonPath("$.firstName")
                        .value("Muhammad"))
                .andExpect(jsonPath("$.lastName")
                        .value("Shehzad"));
    }

    @Test
    void shouldReturnUnauthorizedForInvalidLogin() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "zaib.test@example.com",
                                  "password": "WrongPassword123!"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRefreshAndReturnRotatedTokens() throws Exception {
        UUID userId = UUID.fromString(
                "5e80a2a3-e80d-4d3f-916b-d121f73fb309"
        );

        LoginResponse response = new LoginResponse(
                "rotated-access-token",
                "Bearer",
                Instant.parse("2026-08-01T16:00:00Z"),
                "rotated-refresh-token",
                Instant.parse("2026-08-31T15:00:00Z"),
                userId,
                "zaib.test@example.com",
                "Muhammad",
                "Shehzad"
        );

        when(authService.refresh(any(RefreshTokenRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "current-refresh-token"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken")
                        .value("rotated-access-token"))
                .andExpect(jsonPath("$.refreshToken")
                        .value("rotated-refresh-token"))
                .andExpect(jsonPath("$.expiresAt")
                        .value("2026-08-01T16:00:00Z"))
                .andExpect(jsonPath("$.refreshExpiresAt")
                        .value("2026-08-31T15:00:00Z"))
                .andExpect(jsonPath("$.userId")
                        .value(userId.toString()));
    }

    @Test
    void shouldReturnUnauthorizedForInvalidRefreshToken()
            throws Exception {
        when(authService.refresh(any(RefreshTokenRequest.class)))
                .thenThrow(new InvalidRefreshTokenException());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "invalid-refresh-token"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message")
                        .value(
                                "Refresh session is invalid or expired"
                        ));
    }

    @Test
    void shouldLogoutRefreshSession() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": "active-refresh-token"
                                }
                                """))
                .andExpect(status().isNoContent());

        verify(authService)
                .logout(any(RefreshTokenRequest.class));
    }

    @Test
    void shouldRejectBlankRefreshToken() throws Exception {
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "refreshToken": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}