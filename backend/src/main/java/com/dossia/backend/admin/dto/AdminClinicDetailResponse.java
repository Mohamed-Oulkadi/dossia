package com.dossia.backend.admin.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record AdminClinicDetailResponse(
        UUID id,
        String name,
        String ice,
        String city,
        String subscriptionStatus,
        String plan,
        BigDecimal monthlyFeeMad,
        Instant createdAt,
        List<AdminUserSummaryResponse> users
) {
}
