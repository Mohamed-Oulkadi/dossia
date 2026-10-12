package com.dossia.backend.billing.dto;

import com.dossia.backend.billing.domain.Payment;
import com.dossia.backend.billing.domain.PaymentMethod;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID invoiceId,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        String referenceNumber,
        Instant paymentDate,
        Instant createdAt
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getInvoice() != null ? payment.getInvoice().getId() : null,
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getReferenceNumber(),
                payment.getPaymentDate(),
                payment.getCreatedAt()
        );
    }
}
