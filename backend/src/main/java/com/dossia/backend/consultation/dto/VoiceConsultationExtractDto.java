package com.dossia.backend.consultation.dto;

import java.math.BigDecimal;
import java.util.List;

public record VoiceConsultationExtractDto(
        String rawTranscript,
        String motif,
        String clinicalNotes,
        String diagnosis,
        String bloodPressure,
        BigDecimal weightKg,
        Integer heartRateBpm,
        List<ExtractedMedicationDto> medications,
        List<String> suggestedBilans
) {}
