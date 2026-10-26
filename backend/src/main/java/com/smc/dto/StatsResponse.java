package com.smc.dto;

public record StatsResponse(
        long total,
        long pending,
        long inProgress,
        long resolved,
        long rejected,
        double resolutionRate
) {}
