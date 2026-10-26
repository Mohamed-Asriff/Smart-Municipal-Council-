package com.smc.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRequest {
    private String service;
    private String category;
    private String assessmentNo;
    private BigDecimal amount;
    private String billingPeriod;
    private LocalDate dueDate;
    private Long userId;
}
