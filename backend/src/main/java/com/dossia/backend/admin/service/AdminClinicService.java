package com.dossia.backend.admin.service;

import com.dossia.backend.admin.dto.AdminClinicCreateRequest;
import com.dossia.backend.admin.dto.AdminClinicDetailResponse;
import com.dossia.backend.admin.dto.AdminClinicSummaryResponse;
import com.dossia.backend.admin.dto.AdminUserSummaryResponse;
import com.dossia.backend.auth.domain.Clinic;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminClinicService {

    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminAuditService auditService;

    @Transactional(readOnly = true)
    public List<AdminClinicSummaryResponse> getAllClinics(String search, String status) {
        List<Clinic> clinics = clinicRepository.findAllByOrderByCreatedAtDesc();

        return clinics.stream()
                .filter(clinic -> {
                    if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                        if (!clinic.getSubscriptionStatus().name().equalsIgnoreCase(status)) {
                            return false;
                        }
                    }
                    if (search != null && !search.isBlank()) {
                        String s = search.toLowerCase();
                        boolean matchName = clinic.getName().toLowerCase().contains(s);
                        boolean matchIce = clinic.getIce().contains(s);
                        return matchName || matchIce;
                    }
                    return true;
                })
                .map(this::mapToSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminClinicDetailResponse getClinicDetails(UUID clinicId) {
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new IllegalArgumentException("Cabinet introuvable avec l'identifiant : " + clinicId));

        List<User> users = userRepository.findAllByClinicId(clinicId);
        List<AdminUserSummaryResponse> userSummaries = users.stream()
                .map(u -> AdminUserSummaryResponse.builder()
                        .id(u.getId())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .active(u.isActive())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();

        return AdminClinicDetailResponse.builder()
                .id(clinic.getId())
                .name(clinic.getName())
                .ice(clinic.getIce())
                .city("Casablanca")
                .subscriptionStatus(clinic.getSubscriptionStatus().name())
                .plan("PRO")
                .monthlyFeeMad(BigDecimal.valueOf(1490))
                .createdAt(clinic.getCreatedAt())
                .users(userSummaries)
                .build();
    }

    @Transactional
    public AdminClinicSummaryResponse createClinic(AdminClinicCreateRequest request) {
        if (clinicRepository.existsByIce(request.ice())) {
            throw new IllegalArgumentException("Un cabinet avec l'ICE " + request.ice() + " existe déjà.");
        }
        if (userRepository.existsByEmail(request.doctorEmail())) {
            throw new IllegalArgumentException("Un utilisateur avec l'email " + request.doctorEmail() + " existe déjà.");
        }

        Clinic clinic = Clinic.builder()
                .name(request.name().trim())
                .ice(request.ice().trim())
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .build();

        Clinic savedClinic = clinicRepository.save(clinic);

        User leadDoctor = User.builder()
                .clinicId(savedClinic.getId())
                .firstName(request.doctorFirstName().trim())
                .lastName(request.doctorLastName().trim())
                .email(request.doctorEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode("Dossia2026!"))
                .role(UserRole.DOCTOR)
                .active(true)
                .build();

        userRepository.save(leadDoctor);

        auditService.logEvent(
                "admin@dossia.ma",
                "TENANT_PROVISIONED",
                savedClinic.getName() + " (" + savedClinic.getIce() + ")",
                "INFO",
                "Nouveau cabinet médical alloué sous schéma CNDP isolé avec compte praticien " + leadDoctor.getEmail(),
                "196.200.145.22"
        );

        log.info("Tenant provisioned successfully: id={}, ice={}", savedClinic.getId(), savedClinic.getIce());
        return mapToSummary(savedClinic);
    }

    @Transactional
    public AdminClinicSummaryResponse updateClinicStatus(UUID clinicId, String newStatus) {
        Clinic clinic = clinicRepository.findById(clinicId)
                .orElseThrow(() -> new IllegalArgumentException("Cabinet introuvable avec l'identifiant : " + clinicId));

        SubscriptionStatus nextStatus;
        if (newStatus == null || newStatus.isBlank()) {
            nextStatus = clinic.getSubscriptionStatus() == SubscriptionStatus.ACTIVE
                    ? SubscriptionStatus.SUSPENDED
                    : SubscriptionStatus.ACTIVE;
        } else {
            nextStatus = SubscriptionStatus.valueOf(newStatus.toUpperCase());
        }

        clinic.setSubscriptionStatus(nextStatus);
        Clinic updated = clinicRepository.save(clinic);

        auditService.logEvent(
                "admin@dossia.ma",
                "TENANT_STATUS_UPDATED",
                updated.getName() + " (" + updated.getIce() + ")",
                nextStatus == SubscriptionStatus.ACTIVE ? "INFO" : "WARNING",
                "Statut du cabinet mis à jour vers " + nextStatus,
                "196.200.145.22"
        );

        return mapToSummary(updated);
    }

    @Transactional
    public void resetUserPassword(UUID clinicId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        if (!clinicId.equals(user.getClinicId())) {
            throw new IllegalArgumentException("L'utilisateur n'appartient pas au cabinet spécifié");
        }

        user.setPasswordHash(passwordEncoder.encode("Dossia2026!"));
        userRepository.save(user);

        auditService.logEvent(
                "admin@dossia.ma",
                "USER_PASSWORD_RESET",
                user.getEmail(),
                "WARNING",
                "Réinitialisation administrative du mot de passe pour " + user.getEmail(),
                "196.200.145.22"
        );
    }

    private AdminClinicSummaryResponse mapToSummary(Clinic clinic) {
        List<User> users = userRepository.findAllByClinicId(clinic.getId());
        long doctors = users.stream().filter(u -> u.getRole() == UserRole.DOCTOR).count();
        long secretaries = users.stream().filter(u -> u.getRole() == UserRole.SECRETARY).count();

        User doctor = users.stream()
                .filter(u -> u.getRole() == UserRole.DOCTOR)
                .findFirst()
                .orElse(null);

        String leadDoctorName = doctor != null
                ? "Dr. " + doctor.getFirstName() + " " + doctor.getLastName()
                : "Praticien Référent";
        String leadDoctorEmail = doctor != null ? doctor.getEmail() : "contact@cabinet.ma";

        BigDecimal monthlyFee = BigDecimal.valueOf(1490);

        return AdminClinicSummaryResponse.builder()
                .id(clinic.getId())
                .name(clinic.getName())
                .ice(clinic.getIce())
                .city("Casablanca")
                .subscriptionStatus(clinic.getSubscriptionStatus().name())
                .leadDoctorName(leadDoctorName)
                .leadDoctorEmail(leadDoctorEmail)
                .doctorCount(doctors)
                .secretaryCount(secretaries)
                .monthlyFeeMad(monthlyFee)
                .createdAt(clinic.getCreatedAt())
                .build();
    }
}
