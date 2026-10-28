package com.smc.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class IssueBillRequest {
    private Long userId;
    private String citizenId;
    private String service;
    private String category;
    private String assessmentNo;
    private BigDecimal amount;
    private String billingPeriod;
    private LocalDate dueDate;
    private String payerName;
    private String payerPhone;
}
