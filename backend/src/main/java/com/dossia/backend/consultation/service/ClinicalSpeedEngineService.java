package com.dossia.backend.consultation.service;

import com.dossia.backend.consultation.dto.*;

import java.util.List;
import java.util.UUID;

public interface ClinicalSpeedEngineService {

    List<MedicationCatalogDto> searchMedications(String query);

    List<PrescriptionTemplateDto> getAvailableTemplates();

    PrescriptionTemplateDto createCustomTemplate(PrescriptionTemplateCreateRequest request);

    DiagnosticRequestResponse createDiagnosticRequest(UUID consultationId, DiagnosticRequestCreateRequest request);

    byte[] generateBilanPdf(UUID bilanId);

    MedicalCertificateResponse createMedicalCertificate(UUID consultationId, MedicalCertificateCreateRequest request);

    byte[] generateCertificatePdf(UUID certificateId);
}
