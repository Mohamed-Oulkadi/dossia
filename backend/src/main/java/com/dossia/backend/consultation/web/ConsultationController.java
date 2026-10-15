package com.dossia.backend.consultation.web;

import com.dossia.backend.auth.SecurityUtils;
import com.dossia.backend.consultation.dto.*;
import com.dossia.backend.consultation.service.ClinicalSpeedEngineService;
import com.dossia.backend.consultation.service.ConsultationService;
import com.dossia.backend.consultation.service.FrenchMedicalVoiceScribeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;
    private final ClinicalSpeedEngineService clinicalSpeedEngineService;
    private final FrenchMedicalVoiceScribeService frenchMedicalVoiceScribeService;

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

    // ── French Medical Voice-to-Form Scribe (Dictée Vocale Clinique) ──

    @PostMapping(value = "/voice-scribe/fr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<VoiceConsultationExtractDto> processFrenchVoiceScribe(
            @RequestParam(value = "audio", required = false) MultipartFile audio,
            @RequestParam(value = "transcript", required = false) String transcript,
            @RequestParam(value = "consultationId", required = false) String consultationId
    ) {
        if ((audio == null || audio.isEmpty()) && (transcript == null || transcript.isBlank())) {
            throw new IllegalArgumentException("Le fichier audio ou la transcription de la dictée médicale est requis.");
        }
        if (audio != null && !audio.isEmpty() && audio.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("La taille du fichier audio ne doit pas dépasser 5 Mo (Reçu: " + (audio.getSize() / 1024) + " Ko).");
        }

        UUID parsedConsultationId = null;
        if (consultationId != null && !consultationId.isBlank()
                && !consultationId.equalsIgnoreCase("null")
                && !consultationId.equalsIgnoreCase("undefined")
                && !consultationId.equals("[object Object]")) {
            try {
                parsedConsultationId = UUID.fromString(consultationId.trim());
            } catch (IllegalArgumentException ignored) {
                // Ignore malformed UUID and proceed without linking
            }
        }

        UUID clinicId = SecurityUtils.getCurrentClinicId();
        VoiceConsultationExtractDto extract = frenchMedicalVoiceScribeService.processFrenchMedicalVoice(
                audio, transcript, clinicId, parsedConsultationId
        );
        return ResponseEntity.ok(extract);
    }
}

