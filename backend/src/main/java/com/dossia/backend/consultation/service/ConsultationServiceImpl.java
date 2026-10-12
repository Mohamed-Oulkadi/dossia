package com.dossia.backend.consultation.service;

import com.dossia.backend.common.exception.ResourceNotFoundException;
import com.dossia.backend.consultation.domain.Consultation;
import com.dossia.backend.consultation.domain.Prescription;
import com.dossia.backend.consultation.domain.PrescriptionItem;
import com.dossia.backend.consultation.dto.*;
import com.dossia.backend.consultation.repository.ConsultationRepository;
import com.dossia.backend.consultation.repository.PrescriptionRepository;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ConsultationServiceImpl implements ConsultationService {

    private static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");
    public static final UUID DEFAULT_CLINIC_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientService patientService;
    private final OrdonnancePdfGenerator ordonnancePdfGenerator;
    private final ApplicationEventPublisher eventPublisher;

    private UUID resolveClinicId() {
        UUID current = com.dossia.backend.auth.SecurityUtils.getCurrentClinicId();
        return current != null ? current : DEFAULT_CLINIC_ID;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ConsultationResponse createConsultation(ConsultationCreateRequest request) {
        UUID clinicId = resolveClinicId();
        // Verify patient identity via public PatientService contract (No cross-module repository access)
        PatientResponse patient = patientService.getPatientById(request.patientId());

        Consultation consultation = Consultation.builder()
                .clinicId(clinicId)
                .patientId(patient.id())
                .appointmentId(request.appointmentId())
                .motif(request.motif().trim())
                .clinicalNotes(request.clinicalNotes())
                .diagnosis(request.diagnosis())
                .bloodPressure(request.bloodPressure())
                .weightKg(request.weightKg())
                .heartRateBpm(request.heartRateBpm())
                .build();

        // Optional attached prescription
        if (request.prescription() != null && request.prescription().items() != null && !request.prescription().items().isEmpty()) {
            Prescription prescription = Prescription.builder()
                    .notes(request.prescription().notes())
                    .build();

            for (PrescriptionItemDto itemDto : request.prescription().items()) {
                PrescriptionItem item = PrescriptionItem.builder()
                        .medicationName(itemDto.medicationName().trim())
                        .dosage(itemDto.dosage().trim())
                        .duration(itemDto.duration().trim())
                        .instructions(itemDto.instructions())
                        .build();
                prescription.addItem(item);
            }
            consultation.setPrescription(prescription);
        }

        Consultation saved = consultationRepository.save(consultation);
        log.info("Saved consultation {} for patient {}", saved.getId(), patient.id());

        return mapToResponse(saved, patient);
    }

    @Override
    public ConsultationResponse getConsultationById(UUID id) {
        UUID clinicId = resolveClinicId();
        Consultation consultation = consultationRepository.findByClinicIdAndId(clinicId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'ID: " + id));

        PatientResponse patient = null;
        try {
            patient = patientService.getPatientById(consultation.getPatientId());
        } catch (Exception e) {
            log.warn("Could not load patient for consultation {}", id);
        }

        return mapToResponse(consultation, patient);
    }

    @Override
    public List<ConsultationResponse> getPatientConsultations(UUID patientId) {
        UUID clinicId = resolveClinicId();
        PatientResponse patient = patientService.getPatientById(patientId);
        List<Consultation> consultations = consultationRepository.findByClinicIdAndPatientIdOrderByCreatedAtDesc(clinicId, patientId);

        return consultations.stream()
                .map(c -> mapToResponse(c, patient))
                .toList();
    }

    @Override
    public byte[] generateOrdonnancePdf(UUID consultationId) {
        UUID clinicId = resolveClinicId();
        Consultation consultation = consultationRepository.findByClinicIdAndId(clinicId, consultationId)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation introuvable avec l'ID: " + consultationId));

        Prescription prescription = consultation.getPrescription();
        if (prescription == null) {
            // Check prescription repository directly if needed
            prescription = prescriptionRepository.findByConsultationId(consultationId)
                    .orElse(null);
        }

        PatientResponse patient = patientService.getPatientById(consultation.getPatientId());
        return ordonnancePdfGenerator.generateOrdonnancePdf(consultation, prescription, patient);
    }

    private ConsultationResponse mapToResponse(Consultation consultation, PatientResponse patient) {
        String patientName = (patient != null)
                ? (patient.firstName() + " " + patient.lastName()).trim()
                : "Patient Inconnu";

        Integer patientAge = null;
        if (patient != null && patient.birthDate() != null) {
            patientAge = Period.between(patient.birthDate(), LocalDate.now(CASABLANCA_ZONE)).getYears();
        }

        PrescriptionResponse prescriptionResponse = null;
        if (consultation.getPrescription() != null) {
            Prescription p = consultation.getPrescription();
            List<PrescriptionItemDto> items = p.getItems().stream()
                    .map(i -> new PrescriptionItemDto(i.getMedicationName(), i.getDosage(), i.getDuration(), i.getInstructions()))
                    .toList();
            prescriptionResponse = new PrescriptionResponse(p.getId(), consultation.getId(), p.getNotes(), items, p.getCreatedAt());
        }

        return new ConsultationResponse(
                consultation.getId(),
                consultation.getPatientId(),
                patientName,
                patientAge,
                consultation.getAppointmentId(),
                consultation.getMotif(),
                consultation.getClinicalNotes(),
                consultation.getDiagnosis(),
                consultation.getBloodPressure(),
                consultation.getWeightKg(),
                consultation.getHeartRateBpm(),
                prescriptionResponse,
                consultation.getCreatedAt()
        );
    }
}
