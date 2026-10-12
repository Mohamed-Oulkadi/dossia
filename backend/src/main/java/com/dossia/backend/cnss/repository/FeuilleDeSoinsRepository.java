package com.dossia.backend.cnss.repository;

import com.dossia.backend.cnss.domain.FeuilleDeSoins;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FeuilleDeSoinsRepository extends JpaRepository<FeuilleDeSoins, UUID> {

    List<FeuilleDeSoins> findByPatientIdOrderByGeneratedAtDesc(UUID patientId);

    Optional<FeuilleDeSoins> findByInvoiceId(UUID invoiceId);

    long countByPatientId(UUID patientId);
}
