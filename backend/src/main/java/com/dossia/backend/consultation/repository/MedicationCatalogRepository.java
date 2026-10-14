package com.dossia.backend.consultation.repository;

import com.dossia.backend.consultation.domain.MedicationCatalogItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MedicationCatalogRepository extends JpaRepository<MedicationCatalogItem, UUID> {

    @Query("SELECT m FROM MedicationCatalogItem m " +
           "WHERE LOWER(m.brandName) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "   OR LOWER(m.dci) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY m.brandName ASC")
    List<MedicationCatalogItem> searchMedications(@Param("q") String query, Pageable pageable);
}
