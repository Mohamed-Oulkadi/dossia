package com.dossia.backend.billing.service;

import com.dossia.backend.billing.dto.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BillingService {

    InvoiceResponse createInvoice(InvoiceCreateRequest request);

    PaymentResponse registerPayment(PaymentCreateRequest request);

    InvoiceResponse directEncaissement(DirectPaymentRequest request);

    DailyLedgerResponse getDailyLedger(LocalDate date);

    InvoiceResponse getInvoiceById(UUID id);

    byte[] generateReceiptPdf(UUID invoiceId);

    List<InvoiceResponse> getPendingInvoices(UUID patientId);
}
