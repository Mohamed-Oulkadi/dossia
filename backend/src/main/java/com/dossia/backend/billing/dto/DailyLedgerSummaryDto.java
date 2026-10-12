package com.dossia.backend.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyLedgerSummaryDto(
        LocalDate date,
        BigDecimal totalCash,
        BigDecimal totalTpe,
        BigDecimal totalCheck,
        BigDecimal totalTransfer,
        BigDecimal totalGlobal,
        int transactionCount
) {}
