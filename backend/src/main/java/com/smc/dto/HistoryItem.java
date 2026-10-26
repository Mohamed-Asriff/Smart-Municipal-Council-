package com.smc.dto;

import java.time.ZonedDateTime;

public record HistoryItem(
        String status,
        String note,
        String changedBy,
        ZonedDateTime changedAt
) {}
