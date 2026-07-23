package com.applymate.backend.system;

public record ApiStatusResponse(
        String name,
        String version,
        String status
) {
}