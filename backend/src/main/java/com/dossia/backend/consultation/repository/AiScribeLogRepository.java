package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.AiScribeLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AiScribeLogRepository extends JpaRepository<AiScribeLog, UUID> {

    List<AiScribeLog> findByClinicIdOrderByCreatedAtDesc(UUID clinicId);

    List<AiScribeLog> findByConsultationId(UUID consultationId);
}
