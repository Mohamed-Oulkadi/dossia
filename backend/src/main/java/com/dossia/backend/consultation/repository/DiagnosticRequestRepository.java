package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.DiagnosticRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DiagnosticRequestRepository extends JpaRepository<DiagnosticRequest, UUID> {

    List<DiagnosticRequest> findByClinicIdAndConsultationIdOrderByCreatedAtDesc(UUID clinicId, UUID consultationId);

    Optional<DiagnosticRequest> findByClinicIdAndId(UUID clinicId, UUID id);
}
