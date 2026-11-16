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
import static org.assertj.core.api.Assertions.assertThatThrownBy;

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

    @Autowired
    private com.dossia.backend.auth.service.AuthService authService;

    @Autowired
    private com.dossia.backend.auth.security.LoginRateLimiterService loginRateLimiterService;

    @Test
    @DisplayName("Brute-force protection: 5 consecutive bad password attempts lock the account (HTTP 423)")
    void testBruteForceLockoutViaAuthService() {
        String testEmail = "dr.amrani@dossia.ma";
        String ip = "192.168.1.99";
        loginRateLimiterService.reset(testEmail);

        com.dossia.backend.auth.dto.AuthRequest badPasswordRequest =
                new com.dossia.backend.auth.dto.AuthRequest(testEmail, "WrongPassword123!");

        // First 4 bad attempts should throw BadCredentialsException
        for (int i = 1; i <= 4; i++) {
            assertThatThrownBy(() -> authService.login(badPasswordRequest, ip))
                    .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);
        }

        // 5th bad attempt also throws BadCredentialsException and locks the account
        assertThatThrownBy(() -> authService.login(badPasswordRequest, ip))
                .isInstanceOf(org.springframework.security.authentication.BadCredentialsException.class);

        // 6th attempt is blocked immediately by AccountLockedException before checking credentials
        assertThatThrownBy(() -> authService.login(badPasswordRequest, ip))
                .isInstanceOf(com.dossia.backend.common.exception.AccountLockedException.class)
                .hasMessageContaining("temporairement verrouillé");

        // Clean up
        loginRateLimiterService.reset(testEmail);
    }

    @Test
    @DisplayName("IP Flooding protection: exceeding 10 requests from same IP triggers rate limit (HTTP 429)")
    void testIpFloodingViaAuthService() {
        String floodingIp = "172.16.0.42";
        com.dossia.backend.auth.dto.AuthRequest request =
                new com.dossia.backend.auth.dto.AuthRequest("dr.amrani@dossia.ma", "AnyPassword!");

        // 10 requests consume the IP quota
        for (int i = 1; i <= 10; i++) {
            try {
                authService.login(request, floodingIp);
            } catch (Exception ignored) {
                // Expected BadCredentialsException or other
            }
        }

        // 11th request from the same IP must be rejected by LoginRateLimitExceededException
        assertThatThrownBy(() -> authService.login(request, floodingIp))
                .isInstanceOf(com.dossia.backend.common.exception.LoginRateLimitExceededException.class)
                .hasMessageContaining("Trop de tentatives de connexion");
    }
}
