package com.dossia.backend.consultation.service;

import com.dossia.backend.consultation.domain.AiScribeLog;
import com.dossia.backend.consultation.domain.MedicationCatalogItem;
import com.dossia.backend.consultation.dto.VoiceConsultationExtractDto;
import com.dossia.backend.consultation.repository.AiScribeLogRepository;
import com.dossia.backend.consultation.repository.MedicationCatalogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FrenchMedicalVoiceScribeServiceTest {

    @Mock
    private MedicationCatalogRepository medicationCatalogRepository;

    @Mock
    private AiScribeLogRepository aiScribeLogRepository;

    private FrenchMedicalVoiceScribeServiceImpl scribeService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        scribeService = new FrenchMedicalVoiceScribeServiceImpl(
                medicationCatalogRepository,
                aiScribeLogRepository
        );
    }

    @Test
    @DisplayName("Should extract French medical consultation and match Moroccan drug catalog in offline mock mode")
    void shouldExtractFrenchConsultationAndMatchCatalog() {
        UUID clinicId = UUID.randomUUID();
        MockMultipartFile audioFile = new MockMultipartFile(
                "audio",
                "dictee_medicale.webm",
                "audio/webm",
                new byte[24000] // simulated audio payload
        );

        // Pre-seed mock catalog responses for Augmentin and Doliprane
        UUID augmentinId = UUID.randomUUID();
        MedicationCatalogItem augmentin = MedicationCatalogItem.builder()
                .id(augmentinId)
                .brandName("Augmentin")
                .dci("Amoxicilline / Acide Clavulanique")
                .dosage("1g/125mg")
                .form("Sachet")
                .defaultPosology("1 sachet matin et soir au début des repas")
                .ppvMad(new BigDecimal("112.50"))
                .build();

        UUID dolipraneId = UUID.randomUUID();
        MedicationCatalogItem doliprane = MedicationCatalogItem.builder()
                .id(dolipraneId)
                .brandName("Doliprane")
                .dci("Paracétamol")
                .dosage("1000mg")
                .form("Comprimé")
                .defaultPosology("1 comprimé toutes les 6 heures en cas de douleur ou fièvre")
                .ppvMad(new BigDecimal("18.50"))
                .build();

        when(medicationCatalogRepository.searchMedications(eq("Augmentin"), any(Pageable.class)))
                .thenReturn(List.of(augmentin));
        when(medicationCatalogRepository.searchMedications(eq("Doliprane"), any(Pageable.class)))
                .thenReturn(List.of(doliprane));

        // Act
        VoiceConsultationExtractDto extract = scribeService.processFrenchMedicalVoice(audioFile, clinicId);

        // Assert
        assertThat(extract).isNotNull();
        assertThat(extract.motif()).isNotBlank();
        assertThat(extract.clinicalNotes()).contains("oropharynx");
        assertThat(extract.diagnosis()).isEqualTo("Rhinopharyngite virale aiguë fébrile");
        assertThat(extract.bloodPressure()).isEqualTo("12/8");
        assertThat(extract.weightKg()).isEqualTo(BigDecimal.valueOf(74.0));
        assertThat(extract.heartRateBpm()).isEqualTo(78);

        // Verify Moroccan drug catalog normalization
        assertThat(extract.medications()).hasSize(2);

        var firstMed = extract.medications().get(0);
        assertThat(firstMed.matchedInMoroccanCatalog()).isTrue();
        assertThat(firstMed.matchedCatalogId()).isEqualTo(augmentinId);
        assertThat(firstMed.medicationName()).contains("Augmentin");

        var secondMed = extract.medications().get(1);
        assertThat(secondMed.matchedInMoroccanCatalog()).isTrue();
        assertThat(secondMed.matchedCatalogId()).isEqualTo(dolipraneId);
        assertThat(secondMed.medicationName()).contains("Doliprane");

        // Verify CNDP Law 09-08 Zero-PII Audit Log persistence
        ArgumentCaptor<AiScribeLog> logCaptor = ArgumentCaptor.forClass(AiScribeLog.class);
        verify(aiScribeLogRepository, times(1)).save(logCaptor.capture());

        AiScribeLog savedLog = logCaptor.getValue();
        assertThat(savedLog.getClinicId()).isEqualTo(clinicId);
        assertThat(savedLog.getLanguageCode()).isEqualTo("fr-FR");
        assertThat(savedLog.getRawTranscript()).isNotBlank();
        assertThat(savedLog.getExtractedJson()).contains("Rhinopharyngite");
        assertThat(savedLog.getProcessingTimeMs()).isNotNull();
    }
}
