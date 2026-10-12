package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {

    Optional<Consultation> findByClinicIdAndId(UUID clinicId, UUID id);

    List<Consultation> findByClinicIdAndPatientIdOrderByCreatedAtDesc(UUID clinicId, UUID patientId);

    Optional<Consultation> findByClinicIdAndAppointmentId(UUID clinicId, UUID appointmentId);

    // Backward-compatible query methods for test contexts
    List<Consultation> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    Optional<Consultation> findByAppointmentId(UUID appointmentId);
}
