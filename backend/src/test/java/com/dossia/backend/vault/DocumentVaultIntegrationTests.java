package com.dossia.backend.vault;

import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.security.UserPrincipal;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientCreateRequest;
import com.dossia.backend.patient.dto.PatientResponse;
import com.dossia.backend.vault.domain.DocumentCategory;
import com.dossia.backend.vault.domain.VisibilityLevel;
import com.dossia.backend.vault.dto.DocumentStream;
import com.dossia.backend.vault.dto.PatientDocumentResponse;
import com.dossia.backend.vault.repository.PatientDocumentRepository;
import com.dossia.backend.vault.service.DocumentVaultService;
import com.dossia.backend.vault.service.MinioStorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
class DocumentVaultIntegrationTests {

    private static final UUID TEST_CLINIC_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    @Autowired
    private DocumentVaultService documentVaultService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientDocumentRepository documentRepository;

    @MockitoBean
    private MinioStorageService minioStorageService;

    private PatientResponse patient;

    @BeforeEach
    void setUp() {
        // Authenticate as DOCTOR by default
        setSecurityUser(UserRole.DOCTOR);

        // Mock MinIO operations
        doNothing().when(minioStorageService).uploadObject(anyString(), any(), anyLong(), anyString());
        when(minioStorageService.getObjectStream(anyString()))
                .thenReturn(new ByteArrayInputStream("PDF_BINARY_MOCK_CONTENT".getBytes(StandardCharsets.UTF_8)));

        // Create a unique test patient
        String uniqueCin = "DOC" + (System.currentTimeMillis() % 1000000);
        patient = patientService.createPatient(new PatientCreateRequest(
                "Yassine",
                "El Amrani",
                uniqueCin,
                "0661998877",
                LocalDate.of(1988, 4, 15),
                "987654321",
                "CNSS"
        ));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void setSecurityUser(UserRole role) {
        User user = User.builder()
                .id(UUID.randomUUID())
                .clinicId(TEST_CLINIC_ID)
                .email(role.name().toLowerCase() + "@dossia.ma")
                .passwordHash("hashed")
                .role(role)
                .active(true)
                .build();
        UserPrincipal principal = UserPrincipal.from(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Upload BIOLOGIE document automatically assigns DOCTOR_ONLY visibility and multi-tenant object key")
    void uploadDocument_biologie_doctorOnly() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "bilan_sanguin.pdf",
                "application/pdf",
                "PDF_DATA_CONTENT".getBytes(StandardCharsets.UTF_8)
        );

        PatientDocumentResponse doc = documentVaultService.uploadDocument(
                patient.id(),
                null,
                DocumentCategory.BIOLOGIE,
                "Bilan lipidique et NFS complet",
                file
        );

        assertThat(doc).isNotNull();
        assertThat(doc.patientId()).isEqualTo(patient.id());
        assertThat(doc.clinicId()).isEqualTo(TEST_CLINIC_ID);
        assertThat(doc.category()).isEqualTo(DocumentCategory.BIOLOGIE);
        assertThat(doc.visibilityLevel()).isEqualTo(VisibilityLevel.DOCTOR_ONLY);
        assertThat(doc.objectKey()).startsWith("clinics/" + TEST_CLINIC_ID + "/patients/" + patient.id() + "/");
        assertThat(doc.objectKey()).endsWith(".pdf");
    }

    @Test
    @DisplayName("Upload ADMINISTRATIF_CNSS document assigns SHARED_SECRETARY visibility")
    void uploadDocument_administratif_sharedSecretary() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cin_scan.jpg",
                "image/jpeg",
                "JPEG_DATA".getBytes(StandardCharsets.UTF_8)
        );

        PatientDocumentResponse doc = documentVaultService.uploadDocument(
                patient.id(),
                null,
                DocumentCategory.ADMINISTRATIF_CNSS,
                "Copie carte CIN et attestation AMO",
                file
        );

        assertThat(doc.category()).isEqualTo(DocumentCategory.ADMINISTRATIF_CNSS);
        assertThat(doc.visibilityLevel()).isEqualTo(VisibilityLevel.SHARED_SECRETARY);
    }

    @Test
    @DisplayName("Upload rejects disallowed content types (e.g. text/plain or executables)")
    void uploadDocument_invalidMimeType_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "script.sh",
                "text/plain",
                "echo hello".getBytes(StandardCharsets.UTF_8)
        );

        assertThatThrownBy(() -> documentVaultService.uploadDocument(
                patient.id(),
                null,
                DocumentCategory.BIOLOGIE,
                "Invalid file",
                file
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Format de document non autorisé");
    }

    @Test
    @DisplayName("Secretary can only view SHARED_SECRETARY documents, while Doctor sees all")
    void getPatientDocuments_roleFiltering() {
        MockMultipartFile clinicalFile = new MockMultipartFile(
                "file", "radio_thorax.png", "image/png", "PNG_DATA".getBytes()
        );
        MockMultipartFile adminFile = new MockMultipartFile(
                "file", "carte_mutuelle.pdf", "application/pdf", "PDF_DATA".getBytes()
        );

        // Upload one clinical imaging (DOCTOR_ONLY) and one admin scan (SHARED_SECRETARY)
        documentVaultService.uploadDocument(patient.id(), null, DocumentCategory.RADIOLOGIE_IMAGERIE, "Radio", clinicalFile);
        documentVaultService.uploadDocument(patient.id(), null, DocumentCategory.ADMINISTRATIF_CNSS, "Mutuelle", adminFile);

        // As Doctor: should see both
        setSecurityUser(UserRole.DOCTOR);
        List<PatientDocumentResponse> doctorView = documentVaultService.getPatientDocuments(patient.id());
        assertThat(doctorView).hasSize(2);

        // As Secretary: should only see the admin document
        setSecurityUser(UserRole.SECRETARY);
        List<PatientDocumentResponse> secretaryView = documentVaultService.getPatientDocuments(patient.id());
        assertThat(secretaryView).hasSize(1);
        assertThat(secretaryView.getFirst().category()).isEqualTo(DocumentCategory.ADMINISTRATIF_CNSS);
    }

    @Test
    @DisplayName("Secretary attempting to stream DOCTOR_ONLY document is blocked with 403 AccessDeniedException")
    void streamDocument_secretaryBlockedFromDoctorOnly() {
        MockMultipartFile clinicalFile = new MockMultipartFile(
                "file", "echo_abdo.pdf", "application/pdf", "PDF_DATA".getBytes()
        );

        // Upload as doctor
        PatientDocumentResponse doc = documentVaultService.uploadDocument(
                patient.id(), null, DocumentCategory.RADIOLOGIE_IMAGERIE, "Echo", clinicalFile
        );

        // Switch to secretary
        setSecurityUser(UserRole.SECRETARY);

        assertThatThrownBy(() -> documentVaultService.getDocumentStream(doc.id()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("secret médical");

        // Switch back to doctor: stream succeeds
        setSecurityUser(UserRole.DOCTOR);
        DocumentStream stream = documentVaultService.getDocumentStream(doc.id());
        assertThat(stream).isNotNull();
        assertThat(stream.filename()).isEqualTo("echo_abdo.pdf");
    }

    @Test
    @DisplayName("Soft-delete marks deleted_at timestamp and excludes document from active listing")
    void deleteDocument_softDelete() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "doc.pdf", "application/pdf", "PDF_DATA".getBytes()
        );
        PatientDocumentResponse doc = documentVaultService.uploadDocument(
                patient.id(), null, DocumentCategory.COMPTE_RENDU, "CR", file
        );

        assertThat(documentVaultService.getPatientDocuments(patient.id())).hasSize(1);

        documentVaultService.deleteDocument(doc.id());

        assertThat(documentVaultService.getPatientDocuments(patient.id())).isEmpty();
        assertThat(documentRepository.findById(doc.id())).isPresent();
        assertThat(documentRepository.findById(doc.id()).get().getDeletedAt()).isNotNull();
    }
}
