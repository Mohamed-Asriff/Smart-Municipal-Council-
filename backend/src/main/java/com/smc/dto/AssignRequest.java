package com.smc.dto;

public record AssignRequest(
        String department,
        String priority,
        String assignedOfficer
) {}
