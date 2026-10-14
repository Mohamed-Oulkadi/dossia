package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.MedicalCertificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MedicalCertificateRepository extends JpaRepository<MedicalCertificate, UUID> {

    List<MedicalCertificate> findByClinicIdAndConsultationIdOrderByCreatedAtDesc(UUID clinicId, UUID consultationId);

    Optional<MedicalCertificate> findByClinicIdAndId(UUID clinicId, UUID id);
}
