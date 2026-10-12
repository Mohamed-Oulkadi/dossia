package com.dossia.backend.admin;

import com.dossia.backend.admin.dto.AdminClinicCreateRequest;
import com.dossia.backend.admin.dto.AdminClinicSummaryResponse;
import com.dossia.backend.admin.dto.AdminSubscriptionMetricsResponse;
import com.dossia.backend.admin.service.AdminAuditService;
import com.dossia.backend.admin.service.AdminClinicService;
import com.dossia.backend.admin.service.AdminSubscriptionService;
import com.dossia.backend.auth.domain.Clinic;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AdminIntegrationTests {

    @Autowired
    private AdminClinicService clinicService;

    @Autowired
    private AdminSubscriptionService subscriptionService;

    @Autowired
    private AdminAuditService auditService;

    @Autowired
    private ClinicRepository clinicRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        if (clinicRepository.count() == 0) {
            Clinic clinic = Clinic.builder()
                    .name("Clinique Ibn Sina Agadir")
                    .ice("001234567890123")
                    .subscriptionStatus(SubscriptionStatus.ACTIVE)
                    .build();
            clinic = clinicRepository.save(clinic);

            User doctor = User.builder()
                    .clinicId(clinic.getId())
                    .firstName("Rachid")
                    .lastName("Amrani")
                    .email("dr.amrani.test@dossia.ma")
                    .passwordHash("hash")
                    .role(UserRole.DOCTOR)
                    .active(true)
                    .build();
            userRepository.save(doctor);
        }
    }

    @Test
    @DisplayName("SuperAdmin can list clinics with search and status filters")
    void testListClinics() {
        List<AdminClinicSummaryResponse> clinics = clinicService.getAllClinics(null, null);
        assertThat(clinics).isNotEmpty();
    }

    @Test
    @DisplayName("Subscription service computes valid MRR in MAD and plan breakdown")
    void testSubscriptionMetrics() {
        AdminSubscriptionMetricsResponse metrics = subscriptionService.getMetrics();
        assertThat(metrics).isNotNull();
        assertThat(metrics.totalClinics()).isGreaterThanOrEqualTo(1);
        assertThat(metrics.mrrMad()).isNotNull();
        assertThat(metrics.arrMad()).isNotNull();
    }

    @Test
    @DisplayName("Audit service records and retrieves CNDP security events")
    void testAuditService() {
        var logs = auditService.getRecentAuditLogs();
        assertThat(logs).isNotEmpty();

        auditService.logEvent(
                "admin@dossia.ma",
                "TEST_ACTION",
                "TEST_TENANT",
                "INFO",
                "Vérification de conformité test",
                "127.0.0.1"
        );

        var updated = auditService.getRecentAuditLogs();
        assertThat(updated.getFirst().action()).isEqualTo("TEST_ACTION");
    }

    @Test
    @DisplayName("Provisioning clinic with duplicate ICE throws IllegalArgumentException")
    void testProvisioningDuplicateIce() {
        var existing = clinicService.getAllClinics(null, null).getFirst();

        AdminClinicCreateRequest request = new AdminClinicCreateRequest(
                "Nouveau Cabinet Test",
                existing.ice(),
                "Casablanca",
                "Amine",
                "Tazi",
                "dr.unique.test@dossia.ma",
                "PRO"
        );

        assertThatThrownBy(() -> clinicService.createClinic(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("existe déjà");
    }
}
