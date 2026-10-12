package com.dossia.backend.admin.dto;

import com.dossia.backend.auth.domain.UserRole;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record AdminUserSummaryResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        UserRole role,
        boolean active,
        Instant createdAt
) {
}
