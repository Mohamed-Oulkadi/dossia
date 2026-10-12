package com.dossia.backend.billing.dto;

import java.util.List;

public record DailyLedgerResponse(
        DailyLedgerSummaryDto summary,
        List<DailyLedgerItemDto> transactions
) {}
