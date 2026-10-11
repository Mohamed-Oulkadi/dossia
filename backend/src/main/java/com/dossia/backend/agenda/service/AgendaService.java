package com.dossia.backend.agenda.service;

import com.dossia.backend.agenda.domain.AppointmentStatus;
import com.dossia.backend.agenda.dto.AppointmentCreateRequest;
import com.dossia.backend.agenda.dto.AppointmentResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AgendaService {

    List<AppointmentResponse> getDailySchedule(LocalDate date, String doctorName);

    AppointmentResponse createAppointment(AppointmentCreateRequest request);

    AppointmentResponse updateAppointmentStatus(UUID id, AppointmentStatus status);

    AppointmentResponse getAppointmentById(UUID id);
}
