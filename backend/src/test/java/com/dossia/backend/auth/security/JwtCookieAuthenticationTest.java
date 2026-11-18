package com.dossia.backend.auth.security;

import com.dossia.backend.auth.domain.Clinic;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.dto.AuthRequest;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.UserRepository;
import com.dossia.backend.auth.web.AuthController;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class JwtCookieAuthenticationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ClinicRepository clinicRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testDoctor;

    @BeforeEach
    void setUp() {
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
    @DisplayName("SEC-05: Successful login issues HttpOnly SameSite=Strict cookie with JWT")
    void testLoginIssuesHttpOnlyCookie() throws Exception {
        AuthRequest loginRequest = new AuthRequest("dr.amrani@dossia.ma", "Dossia2026!");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString(AuthController.AUTH_COOKIE_NAME)))
                .andExpect(header().string("Set-Cookie", containsString("HttpOnly")))
                .andExpect(header().string("Set-Cookie", containsString("SameSite=Strict")))
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("dr.amrani@dossia.ma"));
    }

    @Test
    @DisplayName("SEC-05: Authenticated requests succeed using HttpOnly dossia_token cookie without Authorization header")
    void testAuthenticationViaCookie() throws Exception {
        UserPrincipal principal = new UserPrincipal(
                testDoctor.getId(),
                testDoctor.getClinicId(),
                testDoctor.getEmail(),
                testDoctor.getPasswordHash(),
                testDoctor.getRole(),
                testDoctor.isActive()
        );
        String token = jwtService.generateToken(principal);

        Cookie authCookie = new Cookie(AuthController.AUTH_COOKIE_NAME, token);
        authCookie.setHttpOnly(true);
        authCookie.setPath("/");

        // Access /api/v1/auth/me using ONLY the cookie (no Authorization: Bearer header)
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(authCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("dr.amrani@dossia.ma"))
                .andExpect(jsonPath("$.role").value("DOCTOR"));
    }

    @Test
    @DisplayName("SEC-05: Logout clears the dossia_token cookie by setting Max-Age=0")
    void testLogoutClearsCookie() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", containsString(AuthController.AUTH_COOKIE_NAME)))
                .andExpect(header().string("Set-Cookie", containsString("Max-Age=0")));
    }

    @Test
    @DisplayName("SEC-05: Protected endpoint rejects request when cookie is missing or invalid")
    void testUnauthorizedWithoutCookieOrHeader() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());

        Cookie invalidCookie = new Cookie(AuthController.AUTH_COOKIE_NAME, "tampered.jwt.payload");
        mockMvc.perform(get("/api/v1/auth/me")
                        .cookie(invalidCookie))
                .andExpect(status().isUnauthorized());
    }
}
