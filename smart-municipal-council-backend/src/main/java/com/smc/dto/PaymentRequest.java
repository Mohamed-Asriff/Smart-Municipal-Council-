package com.smc.dto;
import lombok.Data;

@Data
public class PaymentRequest {
    private String assessmentNo;
    private String amount;
    private String serviceType;
    private String payerName;
    private String payerPhone;
}