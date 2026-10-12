package com.dossia.backend.billing.dto;

import com.dossia.backend.billing.domain.Invoice;
import com.dossia.backend.billing.domain.InvoiceStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record InvoiceResponse(
        UUID id,
        UUID patientId,
        String patientName,
        UUID consultationId,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        InvoiceStatus status,
        Instant issueDate,
        List<PaymentResponse> payments,
        Instant createdAt
) {
    public static InvoiceResponse from(Invoice invoice, String patientName) {
        List<PaymentResponse> paymentDtos = invoice.getPayments() != null
                ? invoice.getPayments().stream().map(PaymentResponse::from).toList()
                : List.of();

        return new InvoiceResponse(
                invoice.getId(),
                invoice.getPatientId(),
                patientName,
                invoice.getConsultationId(),
                invoice.getTotalAmount(),
                invoice.getTotalPaid(),
                invoice.getRemainingAmount(),
                invoice.getStatus(),
                invoice.getIssueDate(),
                paymentDtos,
                invoice.getCreatedAt()
        );
    }
}
