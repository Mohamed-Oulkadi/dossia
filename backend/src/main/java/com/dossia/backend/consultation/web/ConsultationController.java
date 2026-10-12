package com.dossia.backend.consultation.web;

import com.dossia.backend.consultation.dto.ConsultationCreateRequest;
import com.dossia.backend.consultation.dto.ConsultationResponse;
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
}
