package com.dossia.backend.consultation.service;

import com.dossia.backend.auth.SecurityUtils;
import com.dossia.backend.common.exception.ResourceNotFoundException;
import com.dossia.backend.consultation.domain.*;
import com.dossia.backend.consultation.dto.*;
import com.dossia.backend.consultation.repository.*;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@Transactional(readOnly = true)
public class ClinicalSpeedEngineServiceImpl implements ClinicalSpeedEngineService {

    public static final UUID DEFAULT_CLINIC_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final MedicationCatalogRepository medicationCatalogRepository;
    private final PrescriptionTemplateRepository prescriptionTemplateRepository;
    private final DiagnosticRequestRepository diagnosticRequestRepository;
    private final MedicalCertificateRepository medicalCertificateRepository;
    private final ConsultationRepository consultationRepository;
    private final PatientService patientService;
    private final BilanPdfGenerator bilanPdfGenerator;
    private final CertificatPdfGenerator certificatPdfGenerator;
    private final ObjectMapper objectMapper;

    public ClinicalSpeedEngineServiceImpl(
            MedicationCatalogRepository medicationCatalogRepository,
            PrescriptionTemplateRepository prescriptionTemplateRepository,
            DiagnosticRequestRepository diagnosticRequestRepository,
            MedicalCertificateRepository medicalCertificateRepository,
            ConsultationRepository consultationRepository,
            PatientService patientService,
            BilanPdfGenerator bilanPdfGenerator,
            CertificatPdfGenerator certificatPdfGenerator
    ) {
        this.medicationCatalogRepository = medicationCatalogRepository;
        this.prescriptionTemplateRepository = prescriptionTemplateRepository;
        this.diagnosticRequestRepository = diagnosticRequestRepository;
        this.medicalCertificateRepository = medicalCertificateRepository;
        this.consultationRepository = consultationRepository;
        this.patientService = patientService;
        this.bilanPdfGenerator = bilanPdfGenerator;
        this.certificatPdfGenerator = certificatPdfGenerator;
        this.objectMapper = new ObjectMapper();
    }

    private UUID resolveClinicId() {
        UUID current = SecurityUtils.getCurrentClinicId();
        return current != null ? current : DEFAULT_CLINIC_ID;
    }

    @Override
    public List<MedicationCatalogDto> searchMedications(String query) {
        if (query == null || query.trim().length() < 2) {
            return Collections.emptyList();
        }

        return medicationCatalogRepository.searchMedications(query.trim(), PageRequest.of(0, 10))
                .stream()
                .map(m -> new MedicationCatalogDto(
                        m.getId(),
                        m.getBrandName(),
                        m.getDci(),
                        m.getDosage(),
                        m.getForm(),
                        m.getDefaultPosology(),
                        m.getPpvMad()
                ))
                .toList();
    }

    @Override
    public List<PrescriptionTemplateDto> getAvailableTemplates() {
        UUID clinicId = resolveClinicId();
        List<PrescriptionTemplate> templates = prescriptionTemplateRepository.findAvailableTemplates(clinicId);

        return templates.stream().map(t -> {
            List<PrescriptionItemDto> items = parseTemplateItems(t.getItemsJson());
            return new PrescriptionTemplateDto(
                    t.getId(),
                    t.getClinicId(),
                    t.getClinicId() == null,
                    t.getTitle(),
                    t.getCategory(),
                    items
            );
        }).toList();
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PrescriptionTemplateDto createCustomTemplate(PrescriptionTemplateCreateRequest request) {
        UUID clinicId = resolveClinicId();
        String json;
        try {
            json = objectMapper.writeValueAsString(request.items());
        } catch (Exception e) {
            log.error("Failed to serialize template items to JSON: {}", e.getMessage());
            json = "[]";
        }

        PrescriptionTemplate template = PrescriptionTemplate.builder()
                .clinicId(clinicId)
                .title(request.title().trim())
                .category(request.category() != null ? request.category().trim() : "Cabinet")
                .itemsJson(json)
                .build();

        PrescriptionTemplate saved = prescriptionTemplateRepository.save(template);
        log.info("Saved custom prescription template {} for clinic {}", saved.getId(), clinicId);

        return new PrescriptionTemplateDto(
                saved.getId(),
                saved.getClinicId(),
                false,
                saved.getTitle(),
                saved.getCategory(),
                request.items()
        );
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public DiagnosticRequestResponse createDiagnosticRequest(UUID consultationId, DiagnosticRequestCreateRequest request) {
        UUID clinicId = resolveClinicId();
        Consultation consultation = consultationRepository.findByClinicIdAndId(clinicId, consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'ID: " + consultationId));

        PatientResponse patient = patientService.getPatientById(consultation.getPatientId());

        String json;
        try {
            json = objectMapper.writeValueAsString(request.items());
        } catch (Exception e) {
            log.error("Failed to serialize diagnostic items to JSON: {}", e.getMessage());
            json = "[]";
        }

        DiagnosticRequest diagRequest = DiagnosticRequest.builder()
                .clinicId(clinicId)
                .consultationId(consultation.getId())
                .patientId(consultation.getPatientId())
                .requestType(request.requestType())
                .itemsJson(json)
                .clinicalIndication(request.clinicalIndication())
                .build();

        DiagnosticRequest saved = diagnosticRequestRepository.save(diagRequest);
        log.info("Saved diagnostic request {} ({}) for consultation {}", saved.getId(), saved.getRequestType(), consultationId);

        String patientName = patient != null ? (patient.firstName() + " " + patient.lastName()).trim() : "Patient Inconnu";

        return new DiagnosticRequestResponse(
                saved.getId(),
                saved.getClinicId(),
                saved.getConsultationId(),
                saved.getPatientId(),
                patientName,
                saved.getRequestType(),
                request.items(),
                saved.getClinicalIndication(),
                saved.getCreatedAt()
        );
    }

    @Override
    public byte[] generateBilanPdf(UUID bilanId) {
        UUID clinicId = resolveClinicId();
        DiagnosticRequest request = diagnosticRequestRepository.findByClinicIdAndId(clinicId, bilanId)
                .orElseThrow(() -> new ResourceNotFoundException("Demande de bilan introuvable avec l'ID: " + bilanId));

        PatientResponse patient = patientService.getPatientById(request.getPatientId());
        List<String> items = parseStringList(request.getItemsJson());

        return bilanPdfGenerator.generateBilanPdf(request, items, patient);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public MedicalCertificateResponse createMedicalCertificate(UUID consultationId, MedicalCertificateCreateRequest request) {
        UUID clinicId = resolveClinicId();
        Consultation consultation = consultationRepository.findByClinicIdAndId(clinicId, consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'ID: " + consultationId));

        PatientResponse patient = patientService.getPatientById(consultation.getPatientId());

        Integer restDays = request.restDays();
        if (request.certificateType() == MedicalCertificateType.ARRET_TRAVAIL && restDays == null) {
            if (request.startDate() != null && request.endDate() != null) {
                restDays = (int) ChronoUnit.DAYS.between(request.startDate(), request.endDate()) + 1;
            } else {
                restDays = 1;
            }
        }

        MedicalCertificate cert = MedicalCertificate.builder()
                .clinicId(clinicId)
                .consultationId(consultation.getId())
                .patientId(consultation.getPatientId())
                .certificateType(request.certificateType())
                .restDays(restDays)
                .startDate(request.startDate())
                .endDate(request.endDate())
                .isProlongation(Boolean.TRUE.equals(request.isProlongation()))
                .customNotes(request.customNotes())
                .build();

        MedicalCertificate saved = medicalCertificateRepository.save(cert);
        log.info("Saved medical certificate {} ({}) for consultation {}", saved.getId(), saved.getCertificateType(), consultationId);

        String patientName = patient != null ? (patient.firstName() + " " + patient.lastName()).trim() : "Patient Inconnu";
        String restDaysWords = (restDays != null) ? FrenchNumberSpellout.toWords(restDays) : null;

        return new MedicalCertificateResponse(
                saved.getId(),
                saved.getClinicId(),
                saved.getConsultationId(),
                saved.getPatientId(),
                patientName,
                saved.getCertificateType(),
                saved.getRestDays(),
                restDaysWords,
                saved.getStartDate(),
                saved.getEndDate(),
                saved.getIsProlongation(),
                saved.getCustomNotes(),
                saved.getCreatedAt()
        );
    }

    @Override
    public byte[] generateCertificatePdf(UUID certificateId) {
        UUID clinicId = resolveClinicId();
        MedicalCertificate cert = medicalCertificateRepository.findByClinicIdAndId(clinicId, certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificat médical introuvable avec l'ID: " + certificateId));

        PatientResponse patient = patientService.getPatientById(cert.getPatientId());

        return certificatPdfGenerator.generateCertificatePdf(cert, patient);
    }

    private List<PrescriptionItemDto> parseTemplateItems(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<PrescriptionItemDto>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse prescription template items: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<String> parseStringList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse diagnostic string items: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}
