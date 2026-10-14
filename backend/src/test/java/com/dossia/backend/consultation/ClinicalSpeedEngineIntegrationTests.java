package com.dossia.backend.consultation;

import com.dossia.backend.consultation.domain.DiagnosticRequestType;
import com.dossia.backend.consultation.domain.MedicationCatalogItem;
import com.dossia.backend.consultation.domain.MedicalCertificateType;
import com.dossia.backend.consultation.dto.*;
import com.dossia.backend.consultation.repository.MedicationCatalogRepository;
import com.dossia.backend.consultation.service.ClinicalSpeedEngineService;
import com.dossia.backend.consultation.service.ConsultationService;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientCreateRequest;
import com.dossia.backend.patient.dto.PatientResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class ClinicalSpeedEngineIntegrationTests {

    @Autowired
    private ClinicalSpeedEngineService speedEngineService;

    @Autowired
    private ConsultationService consultationService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private MedicationCatalogRepository medicationCatalogRepository;

    private PatientResponse patient;
    private ConsultationResponse consultation;

    @BeforeEach
    void setUp() {
        // Seed a sample Moroccan medication if not present
        if (medicationCatalogRepository.count() == 0) {
            medicationCatalogRepository.save(MedicationCatalogItem.builder()
                    .brandName("Augmentin 1g/125mg")
                    .dci("Amoxicilline / Acide clavulanique")
                    .dosage("1g/125mg")
                    .form("Sachet")
                    .defaultPosology("1 sachet 2x/jour")
                    .ppvMad(BigDecimal.valueOf(112.50))
                    .build());
        }

        // Create test patient
        patient = patientService.createPatient(new PatientCreateRequest(
                "Yassine",
                "El Idrissi",
                "BJ123456",
                "+212661234567",
                LocalDate.of(1988, 5, 12),
                "123456789",
                "CNSS"
        ));

        // Create test consultation
        consultation = consultationService.createConsultation(new ConsultationCreateRequest(
                patient.id(),
                null,
                "Contrôle médical",
                "Observations d'anamnèse clinique normale.",
                "Syndrome rhinopharyngé",
                "12/8",
                BigDecimal.valueOf(74.5),
                72,
                null
        ));
    }

    @Test
    @DisplayName("Medication catalog search returns accurate top 10 matches by brand or DCI")
    void testSearchMedications() {
        List<MedicationCatalogDto> results = speedEngineService.searchMedications("Augmentin");
        assertThat(results).isNotEmpty();
        assertThat(results.getFirst().brandName()).containsIgnoringCase("Augmentin");

        List<MedicationCatalogDto> dciResults = speedEngineService.searchMedications("Amoxicilline");
        assertThat(dciResults).isNotEmpty();
    }

    @Test
    @DisplayName("Prescription templates can be created and retrieved")
    void testTemplatesLifecycle() {
        PrescriptionTemplateDto created = speedEngineService.createCustomTemplate(new PrescriptionTemplateCreateRequest(
                "Protocole Test HTA",
                "Cardiologie",
                List.of(new PrescriptionItemDto("Amlor 5mg", "1 gélule/jour", "30 jours", "Matin"))
        ));

        assertThat(created.id()).isNotNull();
        assertThat(created.title()).isEqualTo("Protocole Test HTA");

        List<PrescriptionTemplateDto> all = speedEngineService.getAvailableTemplates();
        assertThat(all).anyMatch(t -> t.id().equals(created.id()));
    }

    @Test
    @DisplayName("Doctor can generate a Demande de Bilan and render official A4 PDF")
    void testDiagnosticRequestAndPdf() {
        DiagnosticRequestResponse bilan = speedEngineService.createDiagnosticRequest(
                consultation.id(),
                new DiagnosticRequestCreateRequest(
                        DiagnosticRequestType.BIOLOGIE,
                        List.of("NFS / Hémogramme", "Glycémie à jeun", "HbA1c"),
                        "Bilan métabolique de routine"
                )
        );

        assertThat(bilan.id()).isNotNull();
        assertThat(bilan.items()).hasSize(3);

        byte[] pdfBytes = speedEngineService.generateBilanPdf(bilan.id());
        assertThat(pdfBytes).isNotEmpty();
        assertThat(pdfBytes.length).isGreaterThan(1000);
    }

    @Test
    @DisplayName("Doctor can issue an Arrêt de Travail certificate with anti-fraud spelled-out days and PDF")
    void testMedicalCertificateAndPdf() {
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(4); // 5 days total

        MedicalCertificateResponse cert = speedEngineService.createMedicalCertificate(
                consultation.id(),
                new MedicalCertificateCreateRequest(
                        MedicalCertificateType.ARRET_TRAVAIL,
                        5,
                        start,
                        end,
                        false,
                        "Repos strict à domicile"
                )
        );

        assertThat(cert.id()).isNotNull();
        assertThat(cert.restDays()).isEqualTo(5);
        assertThat(cert.restDaysInWords()).isEqualTo("cinq");

        byte[] pdfBytes = speedEngineService.generateCertificatePdf(cert.id());
        assertThat(pdfBytes).isNotEmpty();
        assertThat(pdfBytes.length).isGreaterThan(1000);
    }
}
