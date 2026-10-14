package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.PrescriptionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PrescriptionTemplateRepository extends JpaRepository<PrescriptionTemplate, UUID> {

    @Query("SELECT t FROM PrescriptionTemplate t " +
           "WHERE t.clinicId IS NULL OR t.clinicId = :clinicId " +
           "ORDER BY t.clinicId ASC NULLS FIRST, t.title ASC")
    List<PrescriptionTemplate> findAvailableTemplates(@Param("clinicId") UUID clinicId);
}
