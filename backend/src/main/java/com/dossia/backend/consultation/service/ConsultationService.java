package com.dossia.backend.consultation.service;

import com.dossia.backend.consultation.dto.ConsultationCreateRequest;
import com.dossia.backend.consultation.dto.ConsultationResponse;

import java.util.List;
import java.util.UUID;

public interface ConsultationService {

    ConsultationResponse createConsultation(ConsultationCreateRequest request);

    ConsultationResponse getConsultationById(UUID id);

    List<ConsultationResponse> getPatientConsultations(UUID patientId);

    byte[] generateOrdonnancePdf(UUID consultationId);
}
