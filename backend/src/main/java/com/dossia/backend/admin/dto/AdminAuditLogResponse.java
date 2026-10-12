package com.dossia.backend.admin.dto;

import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

@Builder
public record AdminAuditLogResponse(
        UUID id,
        Instant timestamp,
        String actorEmail,
        String action,
        String targetTenant,
        String severity,
        String details,
        String ipAddress
) {
}
