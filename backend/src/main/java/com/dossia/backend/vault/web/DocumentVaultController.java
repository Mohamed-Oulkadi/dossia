package com.dossia.backend.vault.web;

import com.dossia.backend.vault.domain.DocumentCategory;
import com.dossia.backend.vault.dto.DocumentStream;
import com.dossia.backend.vault.dto.PatientDocumentResponse;
import com.dossia.backend.vault.service.DocumentVaultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentVaultController {

    private final DocumentVaultService documentVaultService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PatientDocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") UUID patientId,
            @RequestParam(value = "consultationId", required = false) UUID consultationId,
            @RequestParam("category") DocumentCategory category,
            @RequestParam(value = "description", required = false) String description
    ) {
        log.info("Received upload request: file='{}', patientId={}, category={}",
                file.getOriginalFilename(), patientId, category);

        PatientDocumentResponse response = documentVaultService.uploadDocument(
                patientId,
                consultationId,
                category,
                description,
                file
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PatientDocumentResponse>> getPatientDocuments(
            @PathVariable("patientId") UUID patientId
    ) {
        List<PatientDocumentResponse> documents = documentVaultService.getPatientDocuments(patientId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}/stream")
    public ResponseEntity<InputStreamResource> streamDocument(
            @PathVariable("id") UUID id
    ) {
        DocumentStream stream = documentVaultService.getDocumentStream(id);

        String encodedFilename = URLEncoder.encode(stream.filename(), StandardCharsets.UTF_8).replace("+", "%20");
        String contentDisposition = "inline; filename=\"" + stream.filename().replace("\"", "") + "\"; filename*=UTF-8''" + encodedFilename;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.parseMediaType(stream.contentType()))
                .contentLength(stream.contentLength())
                .body(new InputStreamResource(stream.inputStream()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable("id") UUID id
    ) {
        documentVaultService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
