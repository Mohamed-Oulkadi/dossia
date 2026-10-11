package com.dossia.backend.agenda.service;

import com.dossia.backend.agenda.domain.Appointment;
import com.dossia.backend.agenda.domain.AppointmentStatus;
import com.dossia.backend.agenda.dto.AppointmentCreateRequest;
import com.dossia.backend.agenda.dto.AppointmentResponse;
import com.dossia.backend.agenda.repository.AppointmentRepository;
import com.dossia.backend.common.exception.ResourceNotFoundException;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AgendaServiceImpl implements AgendaService {

    public static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");

    private final AppointmentRepository appointmentRepository;
    private final PatientService patientService;

    @Override
    public List<AppointmentResponse> getDailySchedule(LocalDate date, String doctorName) {
        LocalDate queryDate = (date != null) ? date : LocalDate.now(CASABLANCA_ZONE);
        ZonedDateTime startOfDay = queryDate.atStartOfDay(CASABLANCA_ZONE);
        ZonedDateTime endOfDay = startOfDay.plusDays(1);

        Instant startInstant = startOfDay.toInstant();
        Instant endInstant = endOfDay.toInstant();

        List<Appointment> appointments = appointmentRepository.findDailyAppointments(
                startInstant,
                endInstant,
                (doctorName != null && !doctorName.isBlank()) ? doctorName.trim() : null
        );

        return appointments.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AppointmentResponse createAppointment(AppointmentCreateRequest request) {
        // Enforce Casablanca timezone normalization
        ZonedDateTime startInCasablanca = request.startTime().withZoneSameInstant(CASABLANCA_ZONE);
        ZonedDateTime endInCasablanca = request.endTime().withZoneSameInstant(CASABLANCA_ZONE);

        if (!endInCasablanca.isAfter(startInCasablanca)) {
            throw new IllegalArgumentException("L'heure de fin du rendez-vous doit être postérieure à l'heure de début.");
        }

        // Verify patient existence via public PatientService contract (No cross-module repository access)
        PatientResponse patient = patientService.getPatientById(request.patientId());

        Appointment appointment = Appointment.builder()
                .patientId(patient.id())
                .doctorName(request.doctorName().trim())
                .startTime(startInCasablanca.toInstant())
                .endTime(endInCasablanca.toInstant())
                .status(AppointmentStatus.EN_ATTENTE)
                .type(request.type())
                .notes(request.notes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        log.info("Created appointment {} for patient {} with Dr. {}", saved.getId(), patient.id(), saved.getDoctorName());

        return mapToResponse(saved, patient);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AppointmentResponse updateAppointmentStatus(UUID id, AppointmentStatus newStatus) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable avec l'identifiant: " + id));

        AppointmentStatus previousStatus = appointment.getStatus();
        appointment.setStatus(newStatus);
        Appointment updated = appointmentRepository.save(appointment);

        log.info("Transitioned appointment {} status from {} to {}", id, previousStatus, newStatus);
        return mapToResponse(updated);
    }

    @Override
    public AppointmentResponse getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable avec l'identifiant: " + id));
        return mapToResponse(appointment);
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        PatientResponse patient = null;
        try {
            patient = patientService.getPatientById(appointment.getPatientId());
        } catch (Exception e) {
            log.warn("Could not retrieve patient details for patientId: {}", appointment.getPatientId());
        }
        return mapToResponse(appointment, patient);
    }

    private AppointmentResponse mapToResponse(Appointment appointment, PatientResponse patient) {
        String patientName = (patient != null)
                ? (patient.firstName() + " " + patient.lastName()).trim()
                : "Patient Inconnu";
        String patientPhone = (patient != null) ? patient.phoneNumber() : "";

        return new AppointmentResponse(
                appointment.getId(),
                appointment.getPatientId(),
                patientName,
                patientPhone,
                appointment.getDoctorName(),
                appointment.getStartTime().atZone(CASABLANCA_ZONE),
                appointment.getEndTime().atZone(CASABLANCA_ZONE),
                appointment.getStatus(),
                appointment.getType(),
                appointment.getNotes(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }
}
