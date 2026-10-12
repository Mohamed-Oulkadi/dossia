package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {

    List<Consultation> findByPatientIdOrderByCreatedAtDesc(UUID patientId);

    Optional<Consultation> findByAppointmentId(UUID appointmentId);
}
