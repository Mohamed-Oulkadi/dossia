package com.dossia.backend.patient;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {

    Optional<Patient> findByCin(String cin);

    boolean existsByCin(String cin);

    boolean existsByCinAndIdNot(String cin, UUID id);
}
