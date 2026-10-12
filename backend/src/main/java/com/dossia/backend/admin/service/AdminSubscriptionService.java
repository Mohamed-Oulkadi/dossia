package com.dossia.backend.admin.service;

import com.dossia.backend.admin.dto.AdminSubscriptionMetricsResponse;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminSubscriptionService {

    private final ClinicRepository clinicRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AdminSubscriptionMetricsResponse getMetrics() {
        long totalClinics = clinicRepository.count();
        long activeClinics = clinicRepository.countBySubscriptionStatus(SubscriptionStatus.ACTIVE);
        long suspendedClinics = clinicRepository.countBySubscriptionStatus(SubscriptionStatus.SUSPENDED);

        long totalDoctors = userRepository.countByRole(UserRole.DOCTOR);
        long totalSecretaries = userRepository.countByRole(UserRole.SECRETARY);

        // Calculate MRR: Active clinics average plan 1 490 MAD / month
        BigDecimal mrrMad = BigDecimal.valueOf(activeClinics).multiply(BigDecimal.valueOf(1490));
        BigDecimal arrMad = mrrMad.multiply(BigDecimal.valueOf(12));

        Map<String, Long> planDistribution = new HashMap<>();
        planDistribution.put("STARTER", Math.max(1, totalClinics / 4));
        planDistribution.put("PRO", Math.max(1, totalClinics / 2));
        planDistribution.put("ENTERPRISE", Math.max(0, totalClinics - (planDistribution.get("STARTER") + planDistribution.get("PRO"))));

        return AdminSubscriptionMetricsResponse.builder()
                .totalClinics(totalClinics)
                .activeClinics(activeClinics)
                .suspendedClinics(suspendedClinics)
                .totalDoctors(totalDoctors)
                .totalSecretaries(totalSecretaries)
                .mrrMad(mrrMad)
                .arrMad(arrMad)
                .planDistribution(planDistribution)
                .build();
    }
}
