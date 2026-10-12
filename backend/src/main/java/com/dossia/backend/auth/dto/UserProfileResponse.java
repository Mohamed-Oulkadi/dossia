package com.dossia.backend.auth.dto;

import com.dossia.backend.auth.domain.UserRole;

import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        UUID clinicId,
        String clinicName,
        String firstName,
        String lastName,
        String email,
        UserRole role
) {}
