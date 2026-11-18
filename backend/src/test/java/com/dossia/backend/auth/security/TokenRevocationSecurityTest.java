package com.dossia.backend.auth.security;

import com.dossia.backend.auth.domain.Clinic;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.RevokedTokenRepository;
import com.dossia.backend.auth.repository.UserRepository;
import com.dossia.backend.auth.web.AuthController;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TokenRevocationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TokenRevocationService tokenRevocationService;

    @Autowired
    private RevokedTokenRepository revokedTokenRepository;

    @Autowired
    private ClinicRepository clinicRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testDoctor;

    @BeforeEach
    void setUp() {
        tokenRevocationService.clearCache();
        revokedTokenRepository.deleteAll();

        Clinic clinic = clinicRepository.save(Clinic.builder()
                .name("Clinique Ibn Sina Agadir")
                .ice("001234567890123")
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .build());

        testDoctor = userRepository.save(User.builder()
                .clinicId(clinic.getId())
                .firstName("Rachid")
                .lastName("Amrani")
                .email("dr.amrani@dossia.ma")
                .passwordHash(passwordEncoder.encode("Dossia2026!"))
                .role(UserRole.DOCTOR)
                .active(true)
                .build());
    }

    @Test
    @DisplayName("SEC-06: Individual token is revoked upon logout and subsequent calls are rejected with 401")
    void testTokenRevocationOnLogout() throws Exception {
        UserPrincipal principal = new UserPrincipal(
                testDoctor.getId(),
                testDoctor.getClinicId(),
                testDoctor.getEmail(),
                testDoctor.getPasswordHash(),
                testDoctor.getRole(),
                testDoctor.isActive()
        );
        String token = jwtService.generateToken(principal);
        String jti = jwtService.extractJti(token);
        assertThat(jti).isNotBlank();

        Cookie authCookie = new Cookie(AuthController.AUTH_COOKIE_NAME, token);
        authCookie.setHttpOnly(true);
        authCookie.setPath("/");

        // 1. First verify token is valid and accesses /api/v1/auth/me
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("dr.amrani@dossia.ma"));

        // 2. Perform logout passing this cookie
        mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(authCookie))
                .andExpect(status().isNoContent());

        // Verify token is marked as revoked in TokenRevocationService
        assertThat(tokenRevocationService.isRevoked(jti, testDoctor.getId(), jwtService.extractIssuedAt(token))).isTrue();

        // 3. Attempt to reuse the intercepted/saved token — must be rejected with 401 Revoked Token
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(authCookie))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.type").value("https://dossia.ma/errors/revoked-token"))
                .andExpect(jsonPath("$.title").value("Jeton Révoqué"));
    }

    @Test
    @DisplayName("SEC-06: Individual token revoked via Authorization header on logout is rejected")
    void testBearerTokenRevocationOnLogout() throws Exception {
        UserPrincipal principal = new UserPrincipal(
                testDoctor.getId(),
                testDoctor.getClinicId(),
                testDoctor.getEmail(),
                testDoctor.getPasswordHash(),
                testDoctor.getRole(),
                testDoctor.isActive()
        );
        String token = jwtService.generateToken(principal);
        String jti = jwtService.extractJti(token);

        // 1. Verify access via Bearer header
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 2. Logout with Bearer header
        mockMvc.perform(post("/api/v1/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        // 3. Verify Bearer token is immediately rejected
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.type").value("https://dossia.ma/errors/revoked-token"));
    }

    @Test
    @DisplayName("SEC-06: User-level bulk revocation rejects prior tokens while allowing newly issued tokens")
    void testUserLevelBulkRevocation() throws Exception {
        UserPrincipal principal = new UserPrincipal(
                testDoctor.getId(),
                testDoctor.getClinicId(),
                testDoctor.getEmail(),
                testDoctor.getPasswordHash(),
                testDoctor.getRole(),
                testDoctor.isActive()
        );

        // 1. Issue Token 1 before revocation barrier
        String token1 = jwtService.generateToken(principal);

        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(new Cookie(AuthController.AUTH_COOKIE_NAME, token1)))
                .andExpect(status().isOk());

        // Small sleep to ensure timestamp barrier separation
        Thread.sleep(50);

        // 2. Trigger user-level bulk revocation (e.g. admin password reset or deactivation)
        tokenRevocationService.revokeAllUserTokens(testDoctor.getId(), "ADMIN_PASSWORD_RESET");

        // 3. Token 1 must now be rejected
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(new Cookie(AuthController.AUTH_COOKIE_NAME, token1)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.type").value("https://dossia.ma/errors/revoked-token"));

        // Sleep 1.1s so token2's epoch second is strictly greater than the revocation barrier second
        Thread.sleep(1100);

        // 4. Issue Token 2 AFTER the revocation barrier
        String token2 = jwtService.generateToken(principal);

        // Token 2 must succeed!
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(new Cookie(AuthController.AUTH_COOKIE_NAME, token2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("dr.amrani@dossia.ma"));
    }

    @Test
    @DisplayName("SEC-06: Expired token revocations are pruned by scheduled purge task")
    void testPurgeExpiredRevocations() {
        String oldJti = UUID.randomUUID().toString();
        Instant pastExpiry = Instant.now().minus(Duration.ofHours(2));

        // Revoke with past expiration
        tokenRevocationService.revokeToken(oldJti, testDoctor.getId(), pastExpiry, "EXPIRED_TEST");
        assertThat(revokedTokenRepository.existsByJti(oldJti)).isTrue();

        // Run purge
        tokenRevocationService.purgeExpiredRevocations();

        // Verify old record was purged
        assertThat(revokedTokenRepository.existsByJti(oldJti)).isFalse();
    }
}
