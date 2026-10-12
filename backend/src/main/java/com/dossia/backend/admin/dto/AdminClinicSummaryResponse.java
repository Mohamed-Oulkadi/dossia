package com.dossia.backend.admin.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record AdminClinicSummaryResponse(
        UUID id,
        String name,
        String ice,
        String city,
        String subscriptionStatus,
        String leadDoctorName,
        String leadDoctorEmail,
        long doctorCount,
        long secretaryCount,
        BigDecimal monthlyFeeMad,
        Instant createdAt
) {
}
