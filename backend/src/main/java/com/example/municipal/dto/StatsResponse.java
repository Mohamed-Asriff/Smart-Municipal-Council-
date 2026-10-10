package com.example.municipal.dto;

public record StatsResponse(long total, long pending, long inProgress,
                            long resolved, long rejected, double resolutionRate) {}