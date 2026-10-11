package com.dossia.backend.agenda.web;

import com.dossia.backend.agenda.dto.AppointmentCreateRequest;
import com.dossia.backend.agenda.dto.AppointmentResponse;
import com.dossia.backend.agenda.dto.AppointmentStatusUpdateRequest;
import com.dossia.backend.agenda.service.AgendaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agenda")
@RequiredArgsConstructor
public class AgendaController {

    private final AgendaService agendaService;

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getDailySchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String doctorName
    ) {
        List<AppointmentResponse> schedule = agendaService.getDailySchedule(date, doctorName);
        return ResponseEntity.ok(schedule);
    }

    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Valid @RequestBody AppointmentCreateRequest request
    ) {
        AppointmentResponse created = agendaService.createAppointment(request);
        URI location = URI.create("/api/v1/agenda/" + created.id());
        return ResponseEntity.created(location).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(@PathVariable UUID id) {
        AppointmentResponse appointment = agendaService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponse> updateAppointmentStatus(
            @PathVariable UUID id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request
    ) {
        AppointmentResponse updated = agendaService.updateAppointmentStatus(id, request.status());
        return ResponseEntity.ok(updated);
    }
}
