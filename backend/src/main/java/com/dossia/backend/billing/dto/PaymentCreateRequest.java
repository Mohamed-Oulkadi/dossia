package com.dossia.backend.billing.dto;

import com.dossia.backend.billing.domain.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentCreateRequest(
        @NotNull(message = "L'identifiant de la facture est obligatoire")
        UUID invoiceId,

        @NotNull(message = "Le montant du paiement est obligatoire")
        @DecimalMin(value = "0.01", message = "Le montant du paiement doit être supérieur à 0")
        BigDecimal amount,

        @NotNull(message = "Le mode de paiement est obligatoire")
        PaymentMethod paymentMethod,

        String referenceNumber
) {}
