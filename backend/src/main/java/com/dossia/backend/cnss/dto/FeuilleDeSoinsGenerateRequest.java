package com.dossia.backend.cnss.dto;

import com.dossia.backend.cnss.domain.FormType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record FeuilleDeSoinsGenerateRequest(
        @NotNull(message = "L'identifiant du patient est obligatoire")
        UUID patientId,

        UUID invoiceId,

        UUID consultationId,

        FormType formType
) {}
