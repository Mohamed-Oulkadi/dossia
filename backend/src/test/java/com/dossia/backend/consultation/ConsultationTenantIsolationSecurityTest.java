package com.dossia.backend.consultation;

import com.dossia.backend.auth.domain.Clinic;
import com.dossia.backend.auth.domain.SubscriptionStatus;
import com.dossia.backend.auth.domain.User;
import com.dossia.backend.auth.domain.UserRole;
import com.dossia.backend.auth.repository.ClinicRepository;
import com.dossia.backend.auth.repository.UserRepository;
import com.dossia.backend.auth.security.JwtService;
import com.dossia.backend.auth.security.UserPrincipal;
import com.dossia.backend.consultation.domain.DiagnosticRequestType;
import com.dossia.backend.consultation.domain.MedicalCertificateType;
import com.dossia.backend.consultation.dto.*;
import com.dossia.backend.consultation.service.ConsultationService;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientCreateRequest;
import com.dossia.backend.patient.dto.PatientResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ConsultationTenantIsolationSecurityTest {

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

    @Autowired
    private PatientService patientService;

    @Autowired
    private ConsultationService consultationService;

    private Clinic clinicA;
    private Clinic clinicB;

    private User doctorA;
    private User doctorB;
    private User superAdmin;

    private String tokenDoctorA;
    private String tokenDoctorB;
    private String tokenSuperAdmin;

    private PatientResponse patientA;
    private ConsultationResponse consultationA;

    @BeforeEach
    void setUp() {
        objectMapper.findAndRegisterModules();

        // 1. Seed Clinic A (Agadir) & Doctor A
        clinicA = clinicRepository.save(Clinic.builder()
                .name("Clinique Ibn Sina Agadir")
                .ice("001234567890123")
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .build());

        doctorA = userRepository.save(User.builder()
                .clinicId(clinicA.getId())
                .firstName("Rachid")
                .lastName("Amrani")
                .email("dr.amrani@dossia.ma")
                .passwordHash(passwordEncoder.encode("Dossia2026!"))
                .role(UserRole.DOCTOR)
                .active(true)
                .build());

        // 2. Seed Clinic B (Marrakech) & Doctor B
        clinicB = clinicRepository.save(Clinic.builder()
                .name("Cabinet Médical Guéliz Marrakech")
                .ice("009876543210987")
                .subscriptionStatus(SubscriptionStatus.ACTIVE)
                .build());

        doctorB = userRepository.save(User.builder()
                .clinicId(clinicB.getId())
                .firstName("Karim")
                .lastName("Tahiri")
                .email("dr.tahiri@dossia.ma")
                .passwordHash(passwordEncoder.encode("Dossia2026!"))
                .role(UserRole.DOCTOR)
                .active(true)
                .build());

        // 3. Seed Super Admin (No clinicId per CNDP Law 09-08)
        superAdmin = userRepository.save(User.builder()
                .clinicId(null)
                .firstName("Super")
                .lastName("Admin")
                .email("admin@dossia.ma")
                .passwordHash(passwordEncoder.encode("Dossia2026!"))
                .role(UserRole.SUPER_ADMIN)
                .active(true)
                .build());

        // Generate JWTs
        tokenDoctorA = jwtService.generateToken(new UserPrincipal(
                doctorA.getId(), doctorA.getClinicId(), doctorA.getEmail(),
                doctorA.getPasswordHash(), doctorA.getRole(), doctorA.isActive()
        ));

        tokenDoctorB = jwtService.generateToken(new UserPrincipal(
                doctorB.getId(), doctorB.getClinicId(), doctorB.getEmail(),
                doctorB.getPasswordHash(), doctorB.getRole(), doctorB.isActive()
        ));

        tokenSuperAdmin = jwtService.generateToken(new UserPrincipal(
                superAdmin.getId(), null, superAdmin.getEmail(),
                superAdmin.getPasswordHash(), superAdmin.getRole(), superAdmin.isActive()
        ));

        // 4. Create Patient A & Consultation A under Clinic A's context
        UserPrincipal principalA = new UserPrincipal(
                doctorA.getId(), clinicA.getId(), doctorA.getEmail(),
                doctorA.getPasswordHash(), doctorA.getRole(), true
        );
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principalA, null, principalA.getAuthorities())
        );

        patientA = patientService.createPatient(new PatientCreateRequest(
                "Yassine", "El Idrissi", "BJ123456", "+212661234567",
                LocalDate.of(1988, 5, 12), "123456789", "CNSS"
        ));

        PrescriptionCreateRequest prescriptionRequest = new PrescriptionCreateRequest(
                "Prendre après les repas",
                List.of(new PrescriptionItemDto("Augmentin 1g", "1 sachet 2x/jour", "7 jours", "Matin et soir"))
        );

        consultationA = consultationService.createConsultation(new ConsultationCreateRequest(
                patientA.id(), null, "Consultation générale",
                "Examen clinique complet.", "Rhinopharyngite aiguë",
                "12/8", BigDecimal.valueOf(74.5), 72, prescriptionRequest
        ));

        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("SEC-08: Doctor B from Clinic B cannot read Consultation A of Clinic A (HTTP 404)")
    void testDoctorCannotAccessOtherClinicConsultation() throws Exception {
        // Doctor B tries to access Consultation A
        mockMvc.perform(get("/api/v1/consultations/" + consultationA.id())
                        .header("Authorization", "Bearer " + tokenDoctorB))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.type").value("https://dossia.ma/errors/not-found"));

        // Doctor A can access Consultation A
        mockMvc.perform(get("/api/v1/consultations/" + consultationA.id())
                        .header("Authorization", "Bearer " + tokenDoctorA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(consultationA.id().toString()))
                .andExpect(jsonPath("$.patientId").value(patientA.id().toString()));
    }

    @Test
    @DisplayName("SEC-08: Doctor B cannot list patient consultations for Patient A belonging to Clinic A (HTTP 404)")
    void testDoctorCannotAccessOtherClinicPatientConsultations() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/patient/" + patientA.id())
                        .header("Authorization", "Bearer " + tokenDoctorB))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/consultations/patient/" + patientA.id())
                        .header("Authorization", "Bearer " + tokenDoctorA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(consultationA.id().toString()));
    }

    @Test
    @DisplayName("SEC-08: Doctor B cannot download prescription PDF for Consultation A of Clinic A (HTTP 404)")
    void testDoctorCannotDownloadOtherClinicOrdonnancePdf() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/" + consultationA.id() + "/ordonnance/pdf")
                        .header("Authorization", "Bearer " + tokenDoctorB))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/consultations/" + consultationA.id() + "/ordonnance/pdf")
                        .header("Authorization", "Bearer " + tokenDoctorA))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("SEC-08: Doctor B cannot create a Diagnostic Request (Bilan) on Consultation A of Clinic A (HTTP 404)")
    void testDoctorCannotCreateBilanForOtherClinicConsultation() throws Exception {
        DiagnosticRequestCreateRequest bilanReq = new DiagnosticRequestCreateRequest(
                DiagnosticRequestType.BIOLOGIE,
                List.of("NFS", "CRP", "Glycémie à jeun"),
                "Suspicion infection"
        );

        mockMvc.perform(post("/api/v1/consultations/" + consultationA.id() + "/bilans")
                        .header("Authorization", "Bearer " + tokenDoctorB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bilanReq)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("SEC-08: Doctor B cannot create a Medical Certificate on Consultation A of Clinic A (HTTP 404)")
    void testDoctorCannotCreateCertificateForOtherClinicConsultation() throws Exception {
        String certJson = """
                {
                    "certificateType": "SPORT",
                    "startDate": "2026-11-19",
                    "endDate": "2026-11-20",
                    "isProlongation": false,
                    "customNotes": "Apte à la pratique sportive"
                }
                """;

        mockMvc.perform(post("/api/v1/consultations/" + consultationA.id() + "/certificates")
                        .header("Authorization", "Bearer " + tokenDoctorB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(certJson))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("SEC-08: Doctor B cannot create a Consultation targeting Patient A of Clinic A (HTTP 404)")
    void testDoctorCannotCreateConsultationForOtherClinicPatient() throws Exception {
        ConsultationCreateRequest crossTenantReq = new ConsultationCreateRequest(
                patientA.id(), null, "Tentative cross-tenant",
                "Observations illégitimes", "N/A", "12/8",
                BigDecimal.valueOf(70), 70, null
        );

        mockMvc.perform(post("/api/v1/consultations")
                        .header("Authorization", "Bearer " + tokenDoctorB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(crossTenantReq)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("SEC-08: Doctor B cannot link Consultation A in Voice Scribe (HTTP 404)")
    void testDoctorCannotLinkOtherClinicConsultationInVoiceScribe() throws Exception {
        mockMvc.perform(multipart("/api/v1/consultations/voice-scribe/fr")
                        .param("transcript", "Patient présente des céphalées depuis deux jours.")
                        .param("consultationId", consultationA.id().toString())
                        .header("Authorization", "Bearer " + tokenDoctorB))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("SEC-08: SuperAdmin without clinicId is strictly blocked from consultations (HTTP 403 Forbidden)")
    void testSuperAdminBlockedFromConsultations() throws Exception {
        mockMvc.perform(get("/api/v1/consultations/" + consultationA.id())
                        .header("Authorization", "Bearer " + tokenSuperAdmin))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.type").value("https://dossia.ma/errors/forbidden"));
    }
}
