package com.dossia.backend.agenda.dto;

import com.dossia.backend.agenda.domain.AppointmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.ZonedDateTime;
import java.util.UUID;

public record AppointmentCreateRequest(
        @NotNull(message = "L'identifiant du patient est obligatoire.")
        UUID patientId,

        @NotBlank(message = "Le nom du médecin traitant est obligatoire.")
        String doctorName,

        @NotNull(message = "L'heure de début est obligatoire.")
        ZonedDateTime startTime,

        @NotNull(message = "L'heure de fin est obligatoire.")
        ZonedDateTime endTime,

        AppointmentType type,

        String notes
) {
    public AppointmentCreateRequest {
        if (type == null) {
            type = AppointmentType.CONSULTATION;
        }
    }
}
