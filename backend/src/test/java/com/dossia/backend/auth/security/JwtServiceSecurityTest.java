package com.dossia.backend.auth.security;

import com.dossia.backend.auth.domain.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceSecurityTest {

    private static final String VALID_256_BIT_SECRET = "dossia-valid-test-secret-key-32-chars-minimum-hmac256!";

    @Test
    @DisplayName("Constructor throws IllegalStateException when JWT secret is null (CWE-321 / SEC-04)")
    void testWeakSecretRejected_nullSecret() {
        assertThatThrownBy(() -> new JwtService(null, 86400000))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("doit comporter au moins 32 caractères");
    }

    @Test
    @DisplayName("Constructor throws IllegalStateException when JWT secret is blank")
    void testWeakSecretRejected_blankSecret() {
        assertThatThrownBy(() -> new JwtService("   ", 86400000))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("doit comporter au moins 32 caractères");
    }

    @Test
    @DisplayName("Constructor throws IllegalStateException when JWT secret is shorter than 32 characters (256 bits)")
    void testWeakSecretRejected_tooShortSecret() {
        String shortSecret = "too-short-secret-123"; // only 20 chars
        assertThatThrownBy(() -> new JwtService(shortSecret, 86400000))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("doit comporter au moins 32 caractères");
    }

    @Test
    @DisplayName("Constructor succeeds when secret meets or exceeds 32 characters and correctly signs and verifies tokens")
    void testValidSecretAccepted_tokenGenerationAndValidation() {
        JwtService jwtService = new JwtService(VALID_256_BIT_SECRET, 86400000);

        UUID userId = UUID.randomUUID();
        UUID clinicId = UUID.randomUUID();
        UserPrincipal principal = new UserPrincipal(
                userId,
                clinicId,
                "dr.amrani@dossia.ma",
                "hashed",
                UserRole.DOCTOR,
                true
        );

        String token = jwtService.generateToken(principal);
        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token, principal)).isTrue();
        assertThat(jwtService.extractEmail(token)).isEqualTo("dr.amrani@dossia.ma");
        assertThat(jwtService.extractRole(token)).isEqualTo("DOCTOR");
        assertThat(jwtService.extractClinicId(token)).isEqualTo(clinicId);
    }
}
