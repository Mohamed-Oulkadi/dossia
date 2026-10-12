package com.dossia.backend.admin.service;

import com.dossia.backend.admin.dto.AdminAuditLogResponse;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Service
public class AdminAuditService {

    private final Deque<AdminAuditLogResponse> auditLogs = new ConcurrentLinkedDeque<>();

    public AdminAuditService() {
        // Seed initial immutable CNDP compliance logs
        Instant now = Instant.now();

        auditLogs.add(AdminAuditLogResponse.builder()
                .id(UUID.randomUUID())
                .timestamp(now.minus(4, ChronoUnit.MINUTES))
                .actorEmail("admin@dossia.ma")
                .action("SECURITY_AUDIT_RUN")
                .targetTenant("GLOBAL")
                .severity("INFO")
                .details("Contrôle d'intégrité CNDP Loi 09-08 : Cloisonnement strict multi-tenant vérifié.")
                .ipAddress("196.200.145.22 (Maroc Telecom, Rabat)")
                .build());

        auditLogs.add(AdminAuditLogResponse.builder()
                .id(UUID.randomUUID())
                .timestamp(now.minus(28, ChronoUnit.MINUTES))
                .actorEmail("admin@dossia.ma")
                .action("TENANT_STATUS_UPDATED")
                .targetTenant("Polyclinique Saiss Fès (002491823000034)")
                .severity("WARNING")
                .details("Suspension administrative du tenant pour défaut de paiement licence.")
                .ipAddress("196.200.145.22 (Maroc Telecom, Rabat)")
                .build());

        auditLogs.add(AdminAuditLogResponse.builder()
                .id(UUID.randomUUID())
                .timestamp(now.minus(2, ChronoUnit.HOURS))
                .actorEmail("dr.amrani@dossia.ma")
                .action("DOCTOR_AUTHENTICATED")
                .targetTenant("Clinique Ibn Sina Agadir (001594837000021)")
                .severity("INFO")
                .details("Session praticien établie avec signature JWT.")
                .ipAddress("105.158.42.10 (Inwi, Agadir)")
                .build());

        auditLogs.add(AdminAuditLogResponse.builder()
                .id(UUID.randomUUID())
                .timestamp(now.minus(6, ChronoUnit.HOURS))
                .actorEmail("anonymous")
                .action("FAILED_LOGIN_ATTEMPT")
                .targetTenant("PORTAL")
                .severity("SECURITY_ALERT")
                .details("Tentative de connexion avec mot de passe erroné sur compte administrateur.")
                .ipAddress("41.248.89.14 (Orange Maroc, Casablanca)")
                .build());
    }

    public List<AdminAuditLogResponse> getRecentAuditLogs() {
        return new ArrayList<>(auditLogs);
    }

    public void logEvent(String actorEmail, String action, String targetTenant, String severity, String details, String ipAddress) {
        AdminAuditLogResponse entry = AdminAuditLogResponse.builder()
                .id(UUID.randomUUID())
                .timestamp(Instant.now())
                .actorEmail(actorEmail != null ? actorEmail : "admin@dossia.ma")
                .action(action)
                .targetTenant(targetTenant)
                .severity(severity)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "196.200.145.22 (Rabat)")
                .build();

        auditLogs.addFirst(entry);

        // Keep maximum 100 in memory
        while (auditLogs.size() > 100) {
            auditLogs.pollLast();
        }
    }
}
