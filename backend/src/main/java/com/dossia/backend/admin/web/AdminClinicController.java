package com.dossia.backend.admin.web;

import com.dossia.backend.admin.dto.AdminClinicCreateRequest;
import com.dossia.backend.admin.dto.AdminClinicDetailResponse;
import com.dossia.backend.admin.dto.AdminClinicSummaryResponse;
import com.dossia.backend.admin.service.AdminClinicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/clinics")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminClinicController {

    private final AdminClinicService clinicService;

    @GetMapping
    public ResponseEntity<List<AdminClinicSummaryResponse>> getAllClinics(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(clinicService.getAllClinics(search, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminClinicDetailResponse> getClinicDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(clinicService.getClinicDetails(id));
    }

    @PostMapping
    public ResponseEntity<AdminClinicSummaryResponse> createClinic(
            @Valid @RequestBody AdminClinicCreateRequest request
    ) {
        AdminClinicSummaryResponse created = clinicService.createClinic(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdminClinicSummaryResponse> updateClinicStatus(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String newStatus = body != null ? body.get("status") : null;
        return ResponseEntity.ok(clinicService.updateClinicStatus(id, newStatus));
    }

    @PostMapping("/{id}/users/{userId}/reset-password")
    public ResponseEntity<Map<String, String>> resetUserPassword(
            @PathVariable UUID id,
            @PathVariable UUID userId
    ) {
        clinicService.resetUserPassword(id, userId);
        return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès sur Dossia2026!"));
    }
}
