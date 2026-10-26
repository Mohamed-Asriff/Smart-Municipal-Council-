package com.smc.dto;

import java.time.ZonedDateTime;
import java.util.List;

public record TrackResponse(
        String ticketNo,
        String ticketCode,
        String title,
        String category,
        String location,
        String status,
        String priority,
        String department,
        String assignedOfficer,
        String photoUrl,
        String imageUrl,
        ZonedDateTime createdAt,
        List<HistoryItem> history,
        List<?> timeline
) {}
