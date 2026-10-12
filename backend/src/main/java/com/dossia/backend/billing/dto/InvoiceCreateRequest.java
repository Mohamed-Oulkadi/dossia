package com.dossia.backend.billing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record InvoiceCreateRequest(
        @NotNull(message = "L'identifiant du patient est obligatoire")
        UUID patientId,

        UUID consultationId,

        @NotNull(message = "Le montant total est obligatoire")
        @DecimalMin(value = "0.00", message = "Le montant total ne peut pas être négatif")
        BigDecimal totalAmount
) {}
