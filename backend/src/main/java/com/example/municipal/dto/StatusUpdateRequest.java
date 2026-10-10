package com.example.municipal.dto;

import com.example.municipal.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull ComplaintStatus status, String note) {}