package com.dossia.backend.agenda.dto;

import com.dossia.backend.agenda.domain.AppointmentStatus;
import com.dossia.backend.agenda.domain.AppointmentType;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.UUID;

public record AppointmentResponse(
        UUID id,
        UUID patientId,
        String patientName,
        String patientPhone,
        String doctorName,
        ZonedDateTime startTime,
        ZonedDateTime endTime,
        AppointmentStatus status,
        AppointmentType type,
        String notes,
        Instant arrivedAt,
        Instant calledAt,
        Instant createdAt,
        Instant updatedAt
) {}
