package com.dossia.backend.consultation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record PrescriptionTemplateCreateRequest(
        @NotBlank(message = "Le titre du modèle est obligatoire")
        String title,
        String category,
        @NotEmpty(message = "Le modèle doit comporter au moins un médicament")
        List<PrescriptionItemDto> items
) {}
