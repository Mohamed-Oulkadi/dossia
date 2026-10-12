package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {

    Optional<Prescription> findByConsultationId(UUID consultationId);
}
