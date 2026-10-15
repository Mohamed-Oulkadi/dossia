package com.dossia.backend.consultation.service;

import com.dossia.backend.consultation.dto.VoiceConsultationExtractDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface FrenchMedicalVoiceScribeService {

    VoiceConsultationExtractDto processFrenchMedicalVoice(MultipartFile audio, String clientTranscript, UUID clinicId, UUID consultationId);

    default VoiceConsultationExtractDto processFrenchMedicalVoice(MultipartFile audio, UUID clinicId, UUID consultationId) {
        return processFrenchMedicalVoice(audio, null, clinicId, consultationId);
    }

    default VoiceConsultationExtractDto processFrenchMedicalVoice(MultipartFile audio, UUID clinicId) {
        return processFrenchMedicalVoice(audio, null, clinicId, null);
    }
}
