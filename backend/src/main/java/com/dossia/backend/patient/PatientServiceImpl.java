package com.dossia.backend.patient;

import com.dossia.backend.auth.SecurityUtils;
import com.dossia.backend.common.exception.DuplicateCinException;
import com.dossia.backend.common.exception.ResourceNotFoundException;
import com.dossia.backend.patient.dto.PatientCreateRequest;
import com.dossia.backend.patient.dto.PatientResponse;
import com.dossia.backend.patient.dto.PatientUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    public static final UUID DEFAULT_CLINIC_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final PatientRepository patientRepository;

    private UUID resolveClinicId() {
        UUID current = SecurityUtils.getCurrentClinicId();
        return current != null ? current : DEFAULT_CLINIC_ID;
    }

    @Override
    @Transactional
    public PatientResponse createPatient(PatientCreateRequest request) {
        UUID clinicId = resolveClinicId();
        String normalizedCin = request.cin().trim().toUpperCase();

        if (patientRepository.existsByClinicIdAndCin(clinicId, normalizedCin)) {
            throw new DuplicateCinException("Un patient avec le CIN " + normalizedCin + " existe déjà dans votre cabinet.");
        }

        Patient patient = Patient.builder()
                .clinicId(clinicId)
                .firstName(request.firstName().trim())
                .lastName(request.lastName().trim())
                .cin(normalizedCin)
                .phoneNumber(request.phoneNumber().trim())
                .birthDate(request.birthDate())
                .cnssNumber(request.cnssNumber() != null ? request.cnssNumber().trim() : null)
                .mutuelleType(request.mutuelleType() != null ? request.mutuelleType().trim() : null)
                .build();

        Patient saved = patientRepository.save(patient);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientById(UUID id) {
        UUID clinicId = resolveClinicId();
        return patientRepository.findByClinicIdAndId(clinicId, id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Patient avec l'identifiant " + id + " introuvable dans votre cabinet."));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientResponse> getPatients(Pageable pageable) {
        UUID clinicId = resolveClinicId();
        return patientRepository.findAllByClinicId(clinicId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional
    public PatientResponse updatePatient(UUID id, PatientUpdateRequest request) {
        UUID clinicId = resolveClinicId();
        Patient patient = patientRepository.findByClinicIdAndId(clinicId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient avec l'identifiant " + id + " introuvable dans votre cabinet."));

        String normalizedCin = request.cin().trim().toUpperCase();
        if (patientRepository.existsByClinicIdAndCinAndIdNot(clinicId, normalizedCin, id)) {
            throw new DuplicateCinException("Un autre patient de votre cabinet possède déjà le CIN " + normalizedCin + ".");
        }

        patient.setFirstName(request.firstName().trim());
        patient.setLastName(request.lastName().trim());
        patient.setCin(normalizedCin);
        patient.setPhoneNumber(request.phoneNumber().trim());
        patient.setBirthDate(request.birthDate());
        patient.setCnssNumber(request.cnssNumber() != null ? request.cnssNumber().trim() : null);
        patient.setMutuelleType(request.mutuelleType() != null ? request.mutuelleType().trim() : null);

        Patient updated = patientRepository.save(patient);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void deletePatient(UUID id) {
        UUID clinicId = resolveClinicId();
        Patient patient = patientRepository.findByClinicIdAndId(clinicId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient avec l'identifiant " + id + " introuvable dans votre cabinet."));

        // Soft delete per CNDP Loi 09-08 medical retention standard
        patient.setDeletedAt(Instant.now());
        patientRepository.save(patient);
    }

    private PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getCin(),
                patient.getPhoneNumber(),
                patient.getBirthDate(),
                patient.getCnssNumber(),
                patient.getMutuelleType(),
                patient.getCreatedAt(),
                patient.getUpdatedAt()
        );
    }
}
