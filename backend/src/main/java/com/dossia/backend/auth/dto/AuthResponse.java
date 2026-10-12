package com.dossia.backend.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        UserProfileResponse user
) {
    public static AuthResponse of(String token, UserProfileResponse user) {
        return new AuthResponse(token, "Bearer", user);
    }
}
