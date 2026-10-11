# Skill: Spring Modulith Craft & Backend Architecture Standards

> **Scope**: Backend architecture, design patterns, and Java coding standards in `backend/`.  
> **Target Framework**: Spring Boot 3.x / 4.x, Spring Modulith, Java 21+.

---

## 1. Modern Java 21+ Idioms

Dossia backend code leverages modern Java idioms for immutability, conciseness, and runtime performance:

### A. Immutable Records for DTOs & Events
- **Rule**: All API request/response payloads, domain commands, and published events must be declared as `record` types.
- **Example**:
  ```java
  package com.dossia.backend.agenda;

  import java.time.Instant;
  import java.util.UUID;

  public record AppointmentScheduledEvent(
      UUID appointmentId,
      UUID patientId,
      UUID doctorId,
      Instant scheduledTime,
      String motif
  ) {}
  ```

### B. Pattern Matching & Switch Expressions
- Replace cumbersome `if (obj instanceof ...)` casting chains with Java 21 pattern matching:
  ```java
  public String describePayment(PaymentMethod method) {
      return switch (method) {
          case CASH -> "Paiement en espèces au comptoir";
          case CHEQUE -> "Règlement par chèque bancaire";
          case TPE -> "Transaction électronique par carte bancaire (TPE)";
          case TRANSFER -> "Virement bancaire direct";
      };
  }
  ```

### C. Virtual Threads & Non-blocking Concurrency
- Configure virtual threads in `application.yml`:
  ```yaml
  spring:
    threads:
      virtual:
        enabled: true
  ```
- All I/O-bound operations (database queries, external ANAM API calls, PDF generation) automatically benefit from lightweight virtual thread scheduling.

---

## 2. Decoupled Inter-Module Communication

Direct cross-module database querying or repository sharing is strictly prohibited. Communication between modules follows one of two patterns:

### A. Event-Driven Decoupling (Preferred for Side Effects)
When a state transition in one module requires reaction in another (e.g., when an appointment is scheduled, update billing or notify CNSS):

1. **Publish Event**:
   ```java
   @Service
   @RequiredArgsConstructor
   public class AppointmentService {

       private final ApplicationEventPublisher events;
       private final AppointmentRepository repository;

       @Transactional
       public AppointmentResponse schedule(ScheduleAppointmentCommand command) {
           Appointment appt = repository.save(command.toEntity());
           events.publishEvent(new AppointmentScheduledEvent(appt.getId(), appt.getPatientId(), appt.getDoctorId(), appt.getStartTime(), appt.getMotif()));
           return AppointmentResponse.from(appt);
       }
   }
   ```

2. **Consume Event with `@ApplicationModuleListener`**:
   `@ApplicationModuleListener` automatically wraps the listener in `@Transactional(propagation = Propagation.REQUIRES_NEW)` and leverages the Spring Modulith Event Publication Registry:
   ```java
   @Component
   @RequiredArgsConstructor
   public class BillingEventListener {

       private final BillingService billingService;

       @ApplicationModuleListener
       public void onAppointmentScheduled(AppointmentScheduledEvent event) {
           billingService.prepareConsultationInvoice(event.appointmentId(), event.patientId());
       }
   }
   ```

### B. Public Module Service Contracts (Synchronous Queries)
If module A needs data from module B synchronously (e.g., Agenda needs patient name for calendar display), it must inject the **public interface** of the patient module, never its repository or entities:
```java
// Located at com.dossia.backend.patient.PatientService (public interface)
public interface PatientService {
    Optional<PatientSummaryDto> findSummaryById(UUID patientId);
}
```

---

## 3. Data Integrity & Transactional Boundaries

Medical practice data requires absolute consistency. A double-booked slot or mismatched billing record damages clinic operations:

1. **Explicit Transactional Boundaries**:
   - Write operations must declare `@Transactional` explicitly at the service layer, never at controller or repository layers.
   - For appointment scheduling and status updates, declare `@Transactional(isolation = Isolation.READ_COMMITTED)`.
   - Read-only queries must use `@Transactional(readOnly = true)` to optimize Hibernate dirty-checking and connection pool utilization.

2. **Optimistic Locking**:
   - Aggregate root entities (e.g., `Appointment`, `Invoice`) must include `@Version private Long version;` to prevent race conditions during concurrent front-desk updates.

---

## 4. RFC 7807 Standardized Error Handling

All API errors must be formatted as RFC 7807 `ProblemDetail` objects with localized French error messages suitable for medical secretaries:

```java
package com.dossia.backend.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(AppointmentSlotUnavailableException.class)
    public ProblemDetail handleSlotUnavailable(AppointmentSlotUnavailableException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.CONFLICT,
            "Le créneau horaire sélectionné n'est plus disponible."
        );
        problem.setTitle("Conflit de Réservation");
        problem.setType(URI.create("https://dossia.ma/errors/slot-conflict"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("requestedSlot", ex.getSlotTime());
        return problem;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND,
            ex.getMessage()
        );
        problem.setTitle("Ressource Introuvable");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
```

### Standard Response Payload
```json
{
  "type": "https://dossia.ma/errors/slot-conflict",
  "title": "Conflit de Réservation",
  "status": 409,
  "detail": "Le créneau horaire sélectionné n'est plus disponible.",
  "timestamp": "2026-10-11T18:30:00Z",
  "requestedSlot": "2026-10-11T09:30:00"
}
```
