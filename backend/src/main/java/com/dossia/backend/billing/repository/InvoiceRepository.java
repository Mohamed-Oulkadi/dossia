package com.dossia.backend.billing.repository;

import com.dossia.backend.billing.domain.Invoice;
import com.dossia.backend.billing.domain.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.payments WHERE i.id = :id")
    Optional<Invoice> findByIdWithPayments(@Param("id") UUID id);

    List<Invoice> findByPatientIdOrderByIssueDateDesc(UUID patientId);

    List<Invoice> findByPatientIdAndStatusInOrderByIssueDateDesc(UUID patientId, Collection<InvoiceStatus> statuses);

    List<Invoice> findByStatusOrderByIssueDateDesc(InvoiceStatus status);
}
