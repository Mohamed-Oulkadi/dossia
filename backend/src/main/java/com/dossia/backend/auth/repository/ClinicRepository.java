package com.dossia.backend.auth.repository;

import com.dossia.backend.auth.domain.Clinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClinicRepository extends JpaRepository<Clinic, UUID> {

    Optional<Clinic> findByIce(String ice);

    boolean existsByIce(String ice);
}
