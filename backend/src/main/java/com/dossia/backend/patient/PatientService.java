package com.dossia.backend.patient;

import com.dossia.backend.patient.dto.PatientCreateRequest;
import com.dossia.backend.patient.dto.PatientResponse;
import com.dossia.backend.patient.dto.PatientUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Public service contract for the Patient bounded context.
 * Accessible by other modules (e.g. Agenda) or the web layer.
 */
public interface PatientService {

    PatientResponse createPatient(PatientCreateRequest request);

    PatientResponse getPatientById(UUID id);

    Page<PatientResponse> getPatients(Pageable pageable);

    PatientResponse updatePatient(UUID id, PatientUpdateRequest request);

    void deletePatient(UUID id);
}
