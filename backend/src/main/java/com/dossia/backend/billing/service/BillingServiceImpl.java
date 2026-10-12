package com.dossia.backend.billing.service;

import com.dossia.backend.auth.SecurityUtils;
import com.dossia.backend.billing.BillingService;
import com.dossia.backend.billing.domain.Invoice;
import com.dossia.backend.billing.domain.InvoiceStatus;
import com.dossia.backend.billing.domain.Payment;
import com.dossia.backend.billing.domain.PaymentMethod;
import com.dossia.backend.billing.dto.*;
import com.dossia.backend.billing.repository.InvoiceRepository;
import com.dossia.backend.billing.repository.PaymentMethodSummaryProjection;
import com.dossia.backend.billing.repository.PaymentRepository;
import com.dossia.backend.common.exception.ResourceNotFoundException;
import com.dossia.backend.patient.PatientService;
import com.dossia.backend.patient.dto.PatientResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingServiceImpl implements BillingService {

    private static final ZoneId CASABLANCA_ZONE = ZoneId.of("Africa/Casablanca");
    public static final UUID DEFAULT_CLINIC_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PatientService patientService;
    private final ReceiptPdfGenerator receiptPdfGenerator;

    private UUID resolveClinicId() {
        UUID current = SecurityUtils.getCurrentClinicId();
        return current != null ? current : DEFAULT_CLINIC_ID;
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
        UUID clinicId = resolveClinicId();
        PatientResponse patient = patientService.getPatientById(request.patientId());

        BigDecimal amount = request.totalAmount() != null
                ? request.totalAmount().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        Invoice invoice = Invoice.builder()
                .clinicId(clinicId)
                .patientId(request.patientId())
                .consultationId(request.consultationId())
                .totalAmount(amount)
                .status(amount.compareTo(BigDecimal.ZERO) == 0 ? InvoiceStatus.PAYE : InvoiceStatus.NON_PAYE)
                .issueDate(Instant.now())
                .payments(new ArrayList<>())
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        String patientName = patient.firstName() + " " + patient.lastName();
        return InvoiceResponse.from(saved, patientName);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentResponse registerPayment(PaymentCreateRequest request) {
        UUID clinicId = resolveClinicId();
        Invoice invoice = invoiceRepository.findByClinicIdAndIdWithPayments(clinicId, request.invoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable avec l'identifiant: " + request.invoiceId()));

        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amount(amount)
                .paymentMethod(request.paymentMethod())
                .referenceNumber(request.referenceNumber())
                .paymentDate(Instant.now())
                .build();

        invoice.addPayment(payment);
        Payment savedPayment = paymentRepository.save(payment);
        invoiceRepository.save(invoice);

        log.info("Paiement enregistré: {} MAD via {} pour la facture {}", amount, request.paymentMethod(), invoice.getId());
        return PaymentResponse.from(savedPayment);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public InvoiceResponse directEncaissement(DirectPaymentRequest request) {
        UUID clinicId = resolveClinicId();
        PatientResponse patient = patientService.getPatientById(request.patientId());
        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);

        Invoice invoice = Invoice.builder()
                .clinicId(clinicId)
                .patientId(request.patientId())
                .consultationId(request.consultationId())
                .totalAmount(amount)
                .status(InvoiceStatus.PAYE)
                .issueDate(Instant.now())
                .payments(new ArrayList<>())
                .build();

        Payment payment = Payment.builder()
                .amount(amount)
                .paymentMethod(request.paymentMethod())
                .referenceNumber(request.referenceNumber())
                .paymentDate(Instant.now())
                .build();

        invoice.addPayment(payment);
        Invoice saved = invoiceRepository.save(invoice);

        log.info("Encaissement direct réalisé: {} MAD pour le patient {}", amount, patient.firstName() + " " + patient.lastName());
        String patientName = patient.firstName() + " " + patient.lastName();
        return InvoiceResponse.from(saved, patientName);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyLedgerResponse getDailyLedger(LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now(CASABLANCA_ZONE);

        Instant start = queryDate.atStartOfDay(CASABLANCA_ZONE).toInstant();
        Instant end = queryDate.plusDays(1).atStartOfDay(CASABLANCA_ZONE).toInstant();

        // 1. Grouped summaries
        List<PaymentMethodSummaryProjection> projections = paymentRepository.summarizeRevenueByDateRange(start, end);

        BigDecimal cash = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal tpe = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal check = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        BigDecimal transfer = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        int totalTx = 0;

        for (PaymentMethodSummaryProjection p : projections) {
            BigDecimal amt = p.getTotalAmount() != null ? p.getTotalAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
            int count = p.getTxCount() != null ? p.getTxCount().intValue() : 0;
            totalTx += count;

            if (p.getMethod() == PaymentMethod.ESPECES) {
                cash = amt;
            } else if (p.getMethod() == PaymentMethod.TPE) {
                tpe = amt;
            } else if (p.getMethod() == PaymentMethod.CHEQUE) {
                check = amt;
            } else if (p.getMethod() == PaymentMethod.VIREMENT) {
                transfer = amt;
            }
        }

        BigDecimal globalTotal = cash.add(tpe).add(check).add(transfer).setScale(2, RoundingMode.HALF_UP);

        DailyLedgerSummaryDto summary = new DailyLedgerSummaryDto(
                queryDate,
                cash,
                tpe,
                check,
                transfer,
                globalTotal,
                totalTx
        );

        // 2. Transaction line items
        List<Payment> payments = paymentRepository.findPaymentsByDateRange(start, end);
        Map<UUID, PatientResponse> patientCache = new HashMap<>();

        List<DailyLedgerItemDto> items = new ArrayList<>();
        for (Payment p : payments) {
            UUID patientId = p.getInvoice().getPatientId();
            PatientResponse pat = patientCache.computeIfAbsent(patientId, id -> {
                try {
                    return patientService.getPatientById(id);
                } catch (Exception e) {
                    log.warn("Impossible de charger le patient {}", id, e);
                    return null;
                }
            });

            String patName = pat != null ? pat.firstName() + " " + pat.lastName() : "Patient Inconnu";
            String cin = pat != null ? pat.cin() : "-";

            items.add(new DailyLedgerItemDto(
                    p.getId(),
                    p.getInvoice().getId(),
                    patientId,
                    patName,
                    cin,
                    p.getAmount(),
                    p.getPaymentMethod(),
                    p.getReferenceNumber(),
                    p.getPaymentDate()
            ));
        }

        return new DailyLedgerResponse(summary, items);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(UUID id) {
        UUID clinicId = resolveClinicId();
        Invoice invoice = invoiceRepository.findByClinicIdAndIdWithPayments(clinicId, id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable avec l'identifiant: " + id));

        PatientResponse patient = patientService.getPatientById(invoice.getPatientId());
        String patientName = patient != null ? patient.firstName() + " " + patient.lastName() : "Patient Inconnu";
        return InvoiceResponse.from(invoice, patientName);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateReceiptPdf(UUID invoiceId) {
        UUID clinicId = resolveClinicId();
        Invoice invoice = invoiceRepository.findByClinicIdAndIdWithPayments(clinicId, invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Facture introuvable avec l'identifiant: " + invoiceId));

        PatientResponse patient = patientService.getPatientById(invoice.getPatientId());
        return receiptPdfGenerator.generateReceiptPdf(invoice, patient);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getPendingInvoices(UUID patientId) {
        UUID clinicId = resolveClinicId();
        List<InvoiceStatus> pendingStatuses = List.of(InvoiceStatus.NON_PAYE, InvoiceStatus.PARTIEL);
        List<Invoice> invoices = patientId != null
                ? invoiceRepository.findByClinicIdAndPatientIdAndStatusInOrderByIssueDateDesc(clinicId, patientId, pendingStatuses)
                : invoiceRepository.findAllByClinicIdOrderByIssueDateDesc(clinicId).stream()
                    .filter(i -> pendingStatuses.contains(i.getStatus()))
                    .toList();

        Map<UUID, String> patientNames = new HashMap<>();
        return invoices.stream().map(i -> {
            String name = patientNames.computeIfAbsent(i.getPatientId(), id -> {
                try {
                    PatientResponse p = patientService.getPatientById(id);
                    return p.firstName() + " " + p.lastName();
                } catch (Exception e) {
                    return "Patient Inconnu";
                }
            });
            return InvoiceResponse.from(i, name);
        }).toList();
    }
}
