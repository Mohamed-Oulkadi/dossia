package com.dossia.backend.cnss.dto;

import com.dossia.backend.cnss.domain.FeuilleDeSoins;
import com.dossia.backend.cnss.domain.FeuilleDeSoinsStatus;
import com.dossia.backend.cnss.domain.FormType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FeuilleDeSoinsResponse(
        UUID id,
        UUID patientId,
        String patientName,
        String cin,
        String cnssNumber,
        UUID consultationId,
        UUID invoiceId,
        BigDecimal totalAmountPaid,
        FormType formType,
        Instant generatedAt,
        FeuilleDeSoinsStatus status
) {
    public static FeuilleDeSoinsResponse from(
            FeuilleDeSoins fds,
            String patientName,
            String cin,
            String cnssNumber,
            BigDecimal amountPaid
    ) {
        return new FeuilleDeSoinsResponse(
                fds.getId(),
                fds.getPatientId(),
                patientName,
                cin,
                cnssNumber,
                fds.getConsultationId(),
                fds.getInvoiceId(),
                amountPaid,
                fds.getFormType(),
                fds.getGeneratedAt(),
                fds.getStatus()
        );
    }
}
