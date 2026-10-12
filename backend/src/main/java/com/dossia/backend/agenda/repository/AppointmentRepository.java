package com.dossia.backend.agenda.repository;

import com.dossia.backend.agenda.domain.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    Optional<Appointment> findByClinicIdAndId(UUID clinicId, UUID id);

    List<Appointment> findByClinicIdAndStartTimeBetweenOrderByStartTimeAsc(UUID clinicId, Instant start, Instant end);

    List<Appointment> findByClinicIdAndDoctorNameAndStartTimeBetweenOrderByStartTimeAsc(
            UUID clinicId,
            String doctorName,
            Instant start,
            Instant end
    );

    @Query("SELECT a FROM Appointment a WHERE a.clinicId = :clinicId " +
           "AND (:doctorName IS NULL OR a.doctorName = :doctorName) " +
           "AND a.startTime >= :start AND a.startTime < :end ORDER BY a.startTime ASC")
    List<Appointment> findDailyAppointments(
            @Param("clinicId") UUID clinicId,
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("doctorName") String doctorName
    );

    // Fallbacks for test cases without clinic scope
    List<Appointment> findByStartTimeBetweenOrderByStartTimeAsc(Instant start, Instant end);

    @Query("SELECT a FROM Appointment a WHERE (:doctorName IS NULL OR a.doctorName = :doctorName) " +
           "AND a.startTime >= :start AND a.startTime < :end ORDER BY a.startTime ASC")
    List<Appointment> findDailyAppointments(
            @Param("start") Instant start,
            @Param("end") Instant end,
            @Param("doctorName") String doctorName
    );
}
