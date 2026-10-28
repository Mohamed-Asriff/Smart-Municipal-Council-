package com.smc.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentCheckoutRequest {
    private Long paymentId;
    private String paymentMethod;
    private String payerName;
    private String payerPhone;
    private String accountRef;
    private String assessmentNo;
    private String service;
    private String serviceType;
    private BigDecimal amount;
    private String cardType;
    private String last4Digits;
    private String slipData;
}
