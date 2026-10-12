package com.dossia.backend.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByClinicIdAndId(UUID clinicId, UUID id);

    Optional<Patient> findByClinicIdAndCin(UUID clinicId, String cin);

    Page<Patient> findAllByClinicId(UUID clinicId, Pageable pageable);

    boolean existsByClinicIdAndCin(UUID clinicId, String cin);

    boolean existsByClinicIdAndCinAndIdNot(UUID clinicId, String cin, UUID id);

    // Backward-compatible fallbacks for initial test contexts
    Optional<Patient> findByCin(String cin);

    boolean existsByCin(String cin);

    boolean existsByCinAndIdNot(String cin, UUID id);
}
