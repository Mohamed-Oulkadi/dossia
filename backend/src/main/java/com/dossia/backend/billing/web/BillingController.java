package com.dossia.backend.billing.web;

import com.dossia.backend.billing.dto.*;
import com.dossia.backend.billing.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@Slf4j
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
        InvoiceResponse response = billingService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> registerPayment(@Valid @RequestBody PaymentCreateRequest request) {
        PaymentResponse response = billingService.registerPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/direct-encaissement")
    public ResponseEntity<InvoiceResponse> directEncaissement(@Valid @RequestBody DirectPaymentRequest request) {
        InvoiceResponse response = billingService.directEncaissement(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/ledger")
    public ResponseEntity<DailyLedgerResponse> getDailyLedger(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DailyLedgerResponse ledger = billingService.getDailyLedger(date);
        return ResponseEntity.ok(ledger);
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID id) {
        InvoiceResponse response = billingService.getInvoiceById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/invoices/{id}/receipt")
    public ResponseEntity<byte[]> getReceiptPdf(@PathVariable UUID id) {
        byte[] pdfBytes = billingService.generateReceiptPdf(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"recu_" + id + ".pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/invoices/pending")
    public ResponseEntity<List<InvoiceResponse>> getPendingInvoices(
            @RequestParam(required = false) UUID patientId
    ) {
        List<InvoiceResponse> pending = billingService.getPendingInvoices(patientId);
        return ResponseEntity.ok(pending);
    }
}
