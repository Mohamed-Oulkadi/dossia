package com.dossia.backend.billing.dto;

import com.dossia.backend.billing.domain.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record DailyLedgerItemDto(
        UUID paymentId,
        UUID invoiceId,
        UUID patientId,
        String patientName,
        String cin,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        String referenceNumber,
        Instant paymentDate
) {}
