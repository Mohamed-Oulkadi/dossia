package com.dossia.backend.admin.web;

import com.dossia.backend.admin.dto.AdminSubscriptionMetricsResponse;
import com.dossia.backend.admin.service.AdminSubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/subscriptions")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminSubscriptionController {

    private final AdminSubscriptionService subscriptionService;

    @GetMapping("/metrics")
    public ResponseEntity<AdminSubscriptionMetricsResponse> getMetrics() {
        return ResponseEntity.ok(subscriptionService.getMetrics());
    }
}
