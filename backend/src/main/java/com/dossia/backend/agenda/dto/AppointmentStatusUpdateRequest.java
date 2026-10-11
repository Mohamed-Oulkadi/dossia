package com.dossia.backend.agenda.dto;

import com.dossia.backend.agenda.domain.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public record AppointmentStatusUpdateRequest(
        @NotNull(message = "Le statut est obligatoire.")
        AppointmentStatus status
) {}
