package com.smc.dto;

import lombok.Data;

@Data
public class PayHereInitiateRequest {
    private Long paymentId;
    private String billCode;
}
