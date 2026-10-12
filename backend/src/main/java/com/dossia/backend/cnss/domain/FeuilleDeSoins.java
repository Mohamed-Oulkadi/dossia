package com.dossia.backend.cnss.domain;

import com.dossia.backend.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "feuilles_de_soins")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeuilleDeSoins extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "consultation_id")
    private UUID consultationId;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "form_type", length = 20, nullable = false)
    private FormType formType;

    @Column(name = "generated_at", nullable = false)
    @Builder.Default
    private Instant generatedAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private FeuilleDeSoinsStatus status = FeuilleDeSoinsStatus.DRAFT;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
