package com.dossia.backend.consultation.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "medications_catalog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationCatalogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "brand_name", nullable = false, length = 150)
    private String brandName;

    @Column(name = "dci", nullable = false, length = 150)
    private String dci;

    @Column(name = "dosage", nullable = false, length = 100)
    private String dosage;

    @Column(name = "form", nullable = false, length = 50)
    private String form;

    @Column(name = "default_posology")
    private String defaultPosology;

    @Column(name = "ppv_mad", precision = 10, scale = 2)
    private BigDecimal ppvMad;
}
