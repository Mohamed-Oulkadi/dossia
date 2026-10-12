package com.dossia.backend.consultation.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record ConsultationCreateRequest(
        @NotNull(message = "L'identifiant du patient est obligatoire.")
        UUID patientId,

        UUID appointmentId,

        @NotBlank(message = "Le motif de consultation est obligatoire.")
        String motif,

        String clinicalNotes,

        String diagnosis,

        @Pattern(regexp = "^$|^\\d{1,3}/\\d{1,3}$", message = "Format de tension artérielle invalide (ex: 12/8 ou 120/80).")
        String bloodPressure,

        @DecimalMin(value = "0.5", message = "Le poids doit être supérieur à 0.5 kg.")
        @DecimalMax(value = "400.0", message = "Le poids doit être inférieur à 400 kg.")
        BigDecimal weightKg,

        @Min(value = 30, message = "La fréquence cardiaque doit être d'au moins 30 bpm.")
        @Max(value = 250, message = "La fréquence cardiaque doit être inférieure à 250 bpm.")
        Integer heartRateBpm,

        PrescriptionCreateRequest prescription
) {}
