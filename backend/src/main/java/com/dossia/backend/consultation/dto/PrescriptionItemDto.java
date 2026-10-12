package com.dossia.backend.consultation.dto;

import jakarta.validation.constraints.NotBlank;

public record PrescriptionItemDto(
        @NotBlank(message = "Le nom du médicament est obligatoire.")
        String medicationName,

        @NotBlank(message = "La posologie est obligatoire.")
        String dosage,

        @NotBlank(message = "La durée du traitement est obligatoire.")
        String duration,

        String instructions
) {}
