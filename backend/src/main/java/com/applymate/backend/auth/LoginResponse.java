package com.applymate.backend.auth;

import com.applymate.backend.security.AccessTokenGrant;
import com.applymate.backend.user.AppUser;

import java.time.Instant;
import java.util.UUID;

public record LoginResponse(
        String accessToken,
        String tokenType,
        Instant expiresAt,
        String refreshToken,
        Instant refreshExpiresAt,
        UUID userId,
        String email,
        String firstName,
        String lastName
) {

    public static LoginResponse from(
            AppUser user,
            AccessTokenGrant accessTokenGrant,
            RefreshTokenGrant refreshTokenGrant
    ) {
        return new LoginResponse(
                accessTokenGrant.accessToken(),
                accessTokenGrant.tokenType(),
                accessTokenGrant.expiresAt(),
                refreshTokenGrant.refreshToken(),
                refreshTokenGrant.expiresAt(),
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
    }
}