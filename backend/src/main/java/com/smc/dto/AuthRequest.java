package com.smc.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String identifier; // Supports login via username OR email
    private String username;
    private String email;
    private String password;
    private String confirmPassword;
    private String name;
    private String nic;
    private String phone;
    private String address;
    private String zone;
}
