package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;

import java.time.Instant;
import java.util.UUID;

public record RegisterResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        Instant createdAt
) {

    public static RegisterResponse from(AppUser user) {
        return new RegisterResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getCreatedAt()
        );
    }
}