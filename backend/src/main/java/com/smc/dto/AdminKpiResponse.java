package com.smc.dto;

import java.math.BigDecimal;

public record AdminKpiResponse(
        BigDecimal totalRevenue,
        BigDecimal pendingCollections,
        long successfulTransactions,
        long totalTransactions,
        String successRate
) {}
