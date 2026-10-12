package com.dossia.backend.cnss.web;

import com.dossia.backend.cnss.dto.FeuilleDeSoinsGenerateRequest;
import com.dossia.backend.cnss.dto.FeuilleDeSoinsResponse;
import com.dossia.backend.cnss.service.FeuilleDeSoinsOrchestrator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cnss")
@RequiredArgsConstructor
@Slf4j
public class CnssController {

    private final FeuilleDeSoinsOrchestrator feuilleDeSoinsOrchestrator;

    @PostMapping("/generate")
    public ResponseEntity<FeuilleDeSoinsResponse> generateFeuilleDeSoins(
            @Valid @RequestBody FeuilleDeSoinsGenerateRequest request
    ) {
        FeuilleDeSoinsResponse response = feuilleDeSoinsOrchestrator.generate(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getFeuilleDeSoinsPdf(@PathVariable UUID id) {
        byte[] pdfBytes = feuilleDeSoinsOrchestrator.generatePdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"feuille_de_soins_" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<FeuilleDeSoinsResponse>> getFeuillesByPatient(
            @PathVariable UUID patientId
    ) {
        List<FeuilleDeSoinsResponse> list = feuilleDeSoinsOrchestrator.getByPatientId(patientId);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/printed")
    public ResponseEntity<FeuilleDeSoinsResponse> markAsPrinted(@PathVariable UUID id) {
        FeuilleDeSoinsResponse response = feuilleDeSoinsOrchestrator.markAsPrinted(id);
        return ResponseEntity.ok(response);
    }
}
