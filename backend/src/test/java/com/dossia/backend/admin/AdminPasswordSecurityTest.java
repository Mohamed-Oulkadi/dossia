package com.dossia.backend.admin;

import com.dossia.backend.admin.dto.AdminClinicCreateRequest;
import com.dossia.backend.admin.dto.AdminClinicSummaryResponse;
import com.dossia.backend.admin.service.AdminClinicService;
import com.dossia.backend.auth.domain.Clinic;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.dto.ChangePasswordRequest;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.UserRepository;
import com.dossia.backend.auth.security.UserPrincipal;
import com.dossia.backend.auth.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AdminPasswordSecurityTest {

    @Autowired
    private AdminClinicService clinicService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClinicRepository clinicRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("SEC-02: createClinic generates non-default password and flags user for password change")
    void testCreateClinicGeneratesSecureRandomPassword() {
        String ice = "00" + System.currentTimeMillis();
        AdminClinicCreateRequest request = new AdminClinicCreateRequest(
                "Cabinet Test Sec02",
                ice,
                "Rabat",
                "Karim",
                "Bennani",
                "dr.bennani." + System.currentTimeMillis() + "@dossia.ma",
                "PRO"
        );

        AdminClinicSummaryResponse response = clinicService.createClinic(request);
        assertThat(response).isNotNull();

        User doctor = userRepository.findByEmail(request.doctorEmail()).orElseThrow();
        assertThat(doctor.isPasswordChangeRequired()).isTrue();
        assertThat(passwordEncoder.matches("Dossia2026!", doctor.getPasswordHash())).isFalse();
    }

    @Test
    @DisplayName("SEC-02: resetUserPassword generates new random password, flags for rotation, and eliminates default")
    void testResetUserPasswordRotatesRandomly() {
        Clinic clinic = clinicRepository.save(Clinic.builder()
                .name("Cabinet Agadir Sec")
                .ice("009988776655443")
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .build());

        User doctor = userRepository.save(User.builder()
                .clinicId(clinic.getId())
                .firstName("Samir")
                .lastName("Tahiri")
                .email("dr.tahiri." + UUID.randomUUID() + "@dossia.ma")
                .passwordHash(passwordEncoder.encode("InitialSecret2026!"))
                .role(UserRole.DOCTOR)
                .active(true)
                .passwordChangeRequired(false)
                .build());

        clinicService.resetUserPassword(clinic.getId(), doctor.getId());

        User refreshed = userRepository.findById(doctor.getId()).orElseThrow();
        assertThat(refreshed.isPasswordChangeRequired()).isTrue();
        assertThat(passwordEncoder.matches("Dossia2026!", refreshed.getPasswordHash())).isFalse();
        assertThat(passwordEncoder.matches("InitialSecret2026!", refreshed.getPasswordHash())).isFalse();
    }

    @Test
    @DisplayName("SEC-02: changePassword clears flag, validates policy, and rejects bad inputs")
    void testChangePasswordFlow() {
        Clinic clinic = clinicRepository.save(Clinic.builder()
                .name("Cabinet Marrakech")
                .ice("001122334455667")
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .build());

        String initialPassword = "TempPassword123!@#";
        User doctor = userRepository.save(User.builder()
                .clinicId(clinic.getId())
                .firstName("Nadia")
                .lastName("Chraibi")
                .email("dr.chraibi." + UUID.randomUUID() + "@dossia.ma")
                .passwordHash(passwordEncoder.encode(initialPassword))
                .role(UserRole.DOCTOR)
                .active(true)
                .passwordChangeRequired(true)
                .build());

        UserPrincipal principal = UserPrincipal.from(doctor);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );

        // Reject incorrect current password
        assertThatThrownBy(() -> authService.changePassword(new ChangePasswordRequest(
                "WrongCurrent123!",
                "ValidNewPassword2026!#",
                "ValidNewPassword2026!#"
        ))).isInstanceOf(BadCredentialsException.class);

        // Reject matching current password
        assertThatThrownBy(() -> authService.changePassword(new ChangePasswordRequest(
                initialPassword,
                initialPassword,
                initialPassword
        ))).isInstanceOf(IllegalArgumentException.class);

        // Reject mismatched confirmation
        assertThatThrownBy(() -> authService.changePassword(new ChangePasswordRequest(
                initialPassword,
                "StrongNewPassword2026!#",
                "DifferentNewPassword2026!#"
        ))).isInstanceOf(IllegalArgumentException.class);

        // Reject weak password (<12 chars)
        assertThatThrownBy(() -> authService.changePassword(new ChangePasswordRequest(
                initialPassword,
                "Short1!",
                "Short1!"
        ))).isInstanceOf(IllegalArgumentException.class);

        // Valid change
        var authRes = authService.changePassword(new ChangePasswordRequest(
                initialPassword,
                "StrongNewPassword2026!#",
                "StrongNewPassword2026!#"
        ));

        assertThat(authRes).isNotNull();
        assertThat(authRes.user().passwordChangeRequired()).isFalse();

        User updated = userRepository.findById(doctor.getId()).orElseThrow();
        assertThat(updated.isPasswordChangeRequired()).isFalse();
        assertThat(passwordEncoder.matches("StrongNewPassword2026!#", updated.getPasswordHash())).isTrue();
    }
}
