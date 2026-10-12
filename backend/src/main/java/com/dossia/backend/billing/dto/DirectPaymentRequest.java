package com.dossia.backend.billing.dto;

import com.dossia.backend.billing.domain.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Fast 1-step checkout DTO for the medical secretary (3-Second SLA).
 * Automatically creates the invoice and registers the payment in a single atomic transaction.
 */
public record DirectPaymentRequest(
        @NotNull(message = "L'identifiant du patient est obligatoire")
        UUID patientId,

        UUID consultationId,

        @NotNull(message = "Le montant est obligatoire")
        @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
        BigDecimal amount,

        @NotNull(message = "Le mode de paiement est obligatoire")
        PaymentMethod paymentMethod,

        String referenceNumber
) {}
