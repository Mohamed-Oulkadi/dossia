package com.dossia.backend.admin.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.Map;

@Builder
public record AdminSubscriptionMetricsResponse(
        long totalClinics,
        long activeClinics,
        long suspendedClinics,
        long totalDoctors,
        long totalSecretaries,
        BigDecimal mrrMad,
        BigDecimal arrMad,
        Map<String, Long> planDistribution
) {
}
