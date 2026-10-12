package com.dossia.backend.cnss.service;

import com.dossia.backend.billing.dto.InvoiceResponse;
import com.dossia.backend.billing.BillingService;
import com.dossia.backend.cnss.domain.FeuilleDeSoins;
import com.dossia.backend.cnss.domain.FeuilleDeSoinsStatus;
import com.dossia.backend.cnss.domain.FormType;
import com.dossia.backend.cnss.dto.FeuilleDeSoinsGenerateRequest;
import com.dossia.backend.cnss.dto.FeuilleDeSoinsResponse;
import com.dossia.backend.cnss.repository.FeuilleDeSoinsRepository;
import com.dossia.backend.common.exception.ResourceNotFoundException;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeuilleDeSoinsOrchestrator {

    private static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");

    private final FeuilleDeSoinsRepository feuilleDeSoinsRepository;
    private final PatientService patientService;
    private final BillingService billingService;
    private final CnssPdfGenerator cnssPdfGenerator;

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public FeuilleDeSoinsResponse generate(FeuilleDeSoinsGenerateRequest request) {
        PatientResponse patient = patientService.getPatientById(request.patientId());

        BigDecimal amountPaid = BigDecimal.valueOf(300.00); // Standard general practitioner consultation
        if (request.invoiceId() != null) {
            try {
                InvoiceResponse invoice = billingService.getInvoiceById(request.invoiceId());
                if (invoice.paidAmount() != null && invoice.paidAmount().compareTo(BigDecimal.ZERO) > 0) {
                    amountPaid = invoice.paidAmount();
                } else if (invoice.totalAmount() != null) {
                    amountPaid = invoice.totalAmount();
                }
            } catch (Exception e) {
                log.warn("Impossible de récupérer la facture {}, utilisation du montant par défaut", request.invoiceId(), e);
            }
        }

        FormType type = request.formType();
        if (type == null) {
            if (patient.mutuelleType() != null && patient.mutuelleType().toUpperCase().contains("CNOPS")) {
                type = FormType.CNOPS;
            } else if (patient.mutuelleType() != null && patient.mutuelleType().toUpperCase().contains("FAR")) {
                type = FormType.FAR;
            } else {
                type = FormType.CNSS;
            }
        }

        FeuilleDeSoins feuille = FeuilleDeSoins.builder()
                .patientId(request.patientId())
                .consultationId(request.consultationId())
                .invoiceId(request.invoiceId())
                .formType(type)
                .generatedAt(Instant.now())
                .status(FeuilleDeSoinsStatus.DRAFT)
                .build();

        FeuilleDeSoins saved = feuilleDeSoinsRepository.save(feuille);
        log.info("Feuille de soins AMO générée: ID {} pour le patient {}", saved.getId(), patient.lastName());

        String patientName = patient.firstName() + " " + patient.lastName();
        return FeuilleDeSoinsResponse.from(saved, patientName, patient.cin(), patient.cnssNumber(), amountPaid);
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(UUID feuilleId) {
        FeuilleDeSoins feuille = feuilleDeSoinsRepository.findById(feuilleId)
                .orElseThrow(() -> new ResourceNotFoundException("Feuille de soins introuvable avec l'identifiant: " + feuilleId));

        PatientResponse patient = patientService.getPatientById(feuille.getPatientId());

        BigDecimal amountPaid = BigDecimal.valueOf(300.00);
        LocalDate careDate = LocalDate.now(CASABLANCA_ZONE);

        if (feuille.getInvoiceId() != null) {
            try {
                InvoiceResponse invoice = billingService.getInvoiceById(feuille.getInvoiceId());
                if (invoice.paidAmount() != null && invoice.paidAmount().compareTo(BigDecimal.ZERO) > 0) {
                    amountPaid = invoice.paidAmount();
                } else if (invoice.totalAmount() != null) {
                    amountPaid = invoice.totalAmount();
                }
                if (invoice.issueDate() != null) {
                    careDate = invoice.issueDate().atZone(CASABLANCA_ZONE).toLocalDate();
                }
            } catch (Exception e) {
                log.warn("Impossible de récupérer la facture {}, utilisation de la date/montant courants", feuille.getInvoiceId(), e);
            }
        }

        return cnssPdfGenerator.generateFeuilleDeSoinsPdf(feuille, patient, amountPaid, careDate);
    }

    @Transactional(readOnly = true)
    public List<FeuilleDeSoinsResponse> getByPatientId(UUID patientId) {
        PatientResponse patient = patientService.getPatientById(patientId);
        String patientName = patient.firstName() + " " + patient.lastName();

        return feuilleDeSoinsRepository.findByPatientIdOrderByGeneratedAtDesc(patientId).stream()
                .map(f -> {
                    BigDecimal amt = BigDecimal.valueOf(300.00);
                    if (f.getInvoiceId() != null) {
                        try {
                            InvoiceResponse inv = billingService.getInvoiceById(f.getInvoiceId());
                            if (inv.paidAmount() != null) amt = inv.paidAmount();
                        } catch (Exception ignored) {}
                    }
                    return FeuilleDeSoinsResponse.from(f, patientName, patient.cin(), patient.cnssNumber(), amt);
                })
                .toList();
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public FeuilleDeSoinsResponse markAsPrinted(UUID feuilleId) {
        FeuilleDeSoins feuille = feuilleDeSoinsRepository.findById(feuilleId)
                .orElseThrow(() -> new ResourceNotFoundException("Feuille de soins introuvable avec l'identifiant: " + feuilleId));

        feuille.setStatus(FeuilleDeSoinsStatus.PRINTED);
        FeuilleDeSoins saved = feuilleDeSoinsRepository.save(feuille);

        PatientResponse patient = patientService.getPatientById(saved.getPatientId());
        String patientName = patient.firstName() + " " + patient.lastName();
        return FeuilleDeSoinsResponse.from(saved, patientName, patient.cin(), patient.cnssNumber(), BigDecimal.valueOf(300.00));
    }
}
