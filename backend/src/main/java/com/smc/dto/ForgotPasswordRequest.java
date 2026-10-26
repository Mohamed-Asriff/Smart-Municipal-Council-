package com.smc.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String identifier; // email or username
}
