package com.dossia.backend.admin.web;

import com.dossia.backend.admin.dto.AdminAuditLogResponse;
import com.dossia.backend.admin.service.AdminAuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminAuditController {

    private final AdminAuditService auditService;

    @GetMapping("/logs")
    public ResponseEntity<List<AdminAuditLogResponse>> getAuditLogs() {
        return ResponseEntity.ok(auditService.getRecentAuditLogs());
    }
}
