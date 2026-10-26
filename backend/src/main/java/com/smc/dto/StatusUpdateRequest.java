package com.smc.dto;

public record StatusUpdateRequest(
        String status,
        String note,
        String priority,
        String department,
        String assignedOfficer
) {}
