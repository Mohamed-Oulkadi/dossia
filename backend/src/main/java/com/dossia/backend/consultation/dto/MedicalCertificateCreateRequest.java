package com.dossia.backend.consultation.dto;

import com.dossia.backend.consultation.domain.MedicalCertificateType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MedicalCertificateCreateRequest(
        @NotNull(message = "Le type de certificat est obligatoire")
        MedicalCertificateType certificateType,
        Integer restDays,
        @NotNull(message = "La date de début est obligatoire")
        LocalDate startDate,
        @NotNull(message = "La date de fin est obligatoire")
        LocalDate endDate,
        Boolean isProlongation,
        String customNotes
) {}
