package com.dossia.backend.billing.repository;

import com.dossia.backend.billing.domain.PaymentMethod;

import java.math.BigDecimal;

public interface PaymentMethodSummaryProjection {
    PaymentMethod getMethod();
    BigDecimal getTotalAmount();
    Long getTxCount();
}
