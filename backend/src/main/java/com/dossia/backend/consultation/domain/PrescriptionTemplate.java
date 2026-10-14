package com.dossia.backend.consultation.domain;

import com.dossia.backend.common.domain.AuditableEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.UUID;

@Entity
@Table(name = "prescription_templates")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionTemplate extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "clinic_id")
    private UUID clinicId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "items_json", columnDefinition = "TEXT", nullable = false)
    private String itemsJson;
}
