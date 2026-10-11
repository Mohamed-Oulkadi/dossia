package com.dossia.backend.patient.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PatientResponse(
        UUID id,
        String firstName,
        String lastName,
        String cin,
        String phoneNumber,
        LocalDate birthDate,
        String cnssNumber,
        String mutuelleType,
        Instant createdAt,
        Instant updatedAt
) {}
