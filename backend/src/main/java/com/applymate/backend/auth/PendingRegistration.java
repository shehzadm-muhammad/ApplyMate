package com.applymate.backend.auth;

import com.applymate.backend.user.AppUser;

public record PendingRegistration(
        AppUser user,
        IssuedEmailVerificationCode verification
) {
}