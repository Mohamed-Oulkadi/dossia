package com.dossia.backend.auth;

import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.security.JwtService;
import com.dossia.backend.auth.security.UserPrincipal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class AuthIntegrationTests {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Password encoder should correctly match default seeded Dossia password")
    void testPasswordMatches() {
        String rawPassword = "Dossia2026!";
        String encoded = passwordEncoder.encode(rawPassword);
        assertThat(passwordEncoder.matches(rawPassword, encoded)).isTrue();
    }

    @Test
    @DisplayName("JWT service generates signed token with role and clinic_id claims")
    void testJwtGenerationAndClaims() {
        UUID userId = UUID.randomUUID();
        UUID clinicId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(
                userId,
                clinicId,
                "dr.amrani@dossia.ma",
                "hash",
                UserRole.DOCTOR,
                true
        );

        String token = jwtService.generateToken(principal);
        assertThat(token).isNotBlank();

        assertThat(jwtService.extractEmail(token)).isEqualTo("dr.amrani@dossia.ma");
        assertThat(jwtService.extractRole(token)).isEqualTo("DOCTOR");
        assertThat(jwtService.extractClinicId(token)).isEqualTo(clinicId);
        assertThat(jwtService.extractUserId(token)).isEqualTo(userId);
        assertThat(jwtService.isTokenValid(token, principal)).isTrue();
    }

    @Test
    @DisplayName("JWT claims for SuperAdmin have null clinic_id")
    void testJwtSuperAdminWithoutClinicId() {
        UUID userId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(
                userId,
                null,
                "admin@dossia.ma",
                "hash",
                UserRole.SUPER_ADMIN,
                true
        );

        String token = jwtService.generateToken(principal);
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractRole(token)).isEqualTo("SUPER_ADMIN");
        assertThat(jwtService.extractClinicId(token)).isNull();
    }
}
