package com.dossia.backend.billing.repository;

import com.dossia.backend.billing.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByInvoiceIdOrderByPaymentDateAsc(UUID invoiceId);

    @Query("""
        SELECT p.paymentMethod AS method, SUM(p.amount) AS totalAmount, COUNT(p) AS txCount
        FROM Payment p
        WHERE p.paymentDate >= :start AND p.paymentDate < :end
        GROUP BY p.paymentMethod
    """)
    List<PaymentMethodSummaryProjection> summarizeRevenueByDateRange(
            @Param("start") Instant start,
            @Param("end") Instant end
    );

    @Query("""
        SELECT p FROM Payment p
        JOIN FETCH p.invoice i
        WHERE p.paymentDate >= :start AND p.paymentDate < :end
        ORDER BY p.paymentDate DESC
    """)
    List<Payment> findPaymentsByDateRange(
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
