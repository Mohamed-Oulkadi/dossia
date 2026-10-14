package com.dossia.backend.consultation.web;

import com.dossia.backend.consultation.dto.*;
import com.dossia.backend.consultation.service.ClinicalSpeedEngineService;
import com.dossia.backend.consultation.service.ConsultationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;
    private final ClinicalSpeedEngineService clinicalSpeedEngineService;

    @PostMapping
    public ResponseEntity<ConsultationResponse> createConsultation(
            @Valid @RequestBody ConsultationCreateRequest request
    ) {
        ConsultationResponse created = consultationService.createConsultation(request);
        URI location = URI.create("/api/v1/consultations/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultationResponse> getConsultationById(@PathVariable UUID id) {
        ConsultationResponse consultation = consultationService.getConsultationById(id);
        return ResponseEntity.ok(consultation);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConsultationResponse>> getPatientConsultations(@PathVariable UUID patientId) {
        List<ConsultationResponse> consultations = consultationService.getPatientConsultations(patientId);
        return ResponseEntity.ok(consultations);
    }

    @GetMapping("/{id}/ordonnance/pdf")
    public ResponseEntity<byte[]> getOrdonnancePdf(@PathVariable UUID id) {
        byte[] pdfBytes = consultationService.generateOrdonnancePdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"ordonnance-" + id + ".pdf\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(pdfBytes);
    }

    // ── Clinical Speed Engine: Drug Catalog & Autocomplete ──

    @GetMapping("/catalog/medications")
    public ResponseEntity<List<MedicationCatalogDto>> searchMedications(@RequestParam(name = "q", defaultValue = "") String query) {
        List<MedicationCatalogDto> results = clinicalSpeedEngineService.searchMedications(query);
        return ResponseEntity.ok(results);
    }

    // ── Clinical Speed Engine: Prescription Templates ──

    @GetMapping("/templates")
    public ResponseEntity<List<PrescriptionTemplateDto>> getTemplates() {
        List<PrescriptionTemplateDto> templates = clinicalSpeedEngineService.getAvailableTemplates();
        return ResponseEntity.ok(templates);
    }

    @PostMapping("/templates")
    public ResponseEntity<PrescriptionTemplateDto> createTemplate(@Valid @RequestBody PrescriptionTemplateCreateRequest request) {
        PrescriptionTemplateDto created = clinicalSpeedEngineService.createCustomTemplate(request);
        URI location = URI.create("/api/v1/consultations/templates/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    // ── Clinical Speed Engine: Demandes de Bilans ──

    @PostMapping("/{consultationId}/bilans")
    public ResponseEntity<DiagnosticRequestResponse> createBilan(
            @PathVariable UUID consultationId,
            @Valid @RequestBody DiagnosticRequestCreateRequest request
    ) {
        DiagnosticRequestResponse created = clinicalSpeedEngineService.createDiagnosticRequest(consultationId, request);
        URI location = URI.create("/api/v1/consultations/bilans/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/bilans/{id}/pdf")
    public ResponseEntity<byte[]> getBilanPdf(@PathVariable UUID id) {
        byte[] pdfBytes = clinicalSpeedEngineService.generateBilanPdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"demande-bilan-" + id + ".pdf\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(pdfBytes);
    }

    // ── Clinical Speed Engine: Certificats Médicaux ──

    @PostMapping("/{consultationId}/certificates")
    public ResponseEntity<MedicalCertificateResponse> createCertificate(
            @PathVariable UUID consultationId,
            @Valid @RequestBody MedicalCertificateCreateRequest request
    ) {
        MedicalCertificateResponse created = clinicalSpeedEngineService.createMedicalCertificate(consultationId, request);
        URI location = URI.create("/api/v1/consultations/certificates/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/certificates/{id}/pdf")
    public ResponseEntity<byte[]> getCertificatePdf(@PathVariable UUID id) {
        byte[] pdfBytes = clinicalSpeedEngineService.generateCertificatePdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"certificat-medical-" + id + ".pdf\"")
                .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                .body(pdfBytes);
    }
}

