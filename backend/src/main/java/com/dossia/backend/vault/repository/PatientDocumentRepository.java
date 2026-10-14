package com.dossia.backend.vault.repository;

import com.dossia.backend.vault.domain.PatientDocument;
import com.dossia.backend.vault.domain.VisibilityLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientDocumentRepository extends JpaRepository<PatientDocument, UUID> {

    List<PatientDocument> findByClinicIdAndPatientIdAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID clinicId,
            UUID patientId
    );

    List<PatientDocument> findByClinicIdAndPatientIdAndVisibilityLevelAndDeletedAtIsNullOrderByCreatedAtDesc(
            UUID clinicId,
            UUID patientId,
            VisibilityLevel visibilityLevel
    );

    Optional<PatientDocument> findByClinicIdAndIdAndDeletedAtIsNull(
            UUID clinicId,
            UUID id
    );

    Optional<PatientDocument> findByObjectKey(String objectKey);
}
