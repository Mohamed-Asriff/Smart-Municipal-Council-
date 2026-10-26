package com.smc.dto;

import com.smc.entity.Complaint;
import java.time.ZonedDateTime;

public record ComplaintResponse(
        Long id,
        String ticketNo,
        String ticketCode,
        Long citizenId,
        String citizenName,
        String title,
        String category,
        String description,
        String zone,
        String location,
        Double latitude,
        Double longitude,
        String imageUrl,
        String photoUrl,
        String status,
        String priority,
        String department,
        String assignedOfficer,
        ZonedDateTime assignedAt,
        ZonedDateTime resolvedAt,
        String resolutionNotes,
        ZonedDateTime createdAt,
        ZonedDateTime updatedAt
) {
    public static ComplaintResponse from(Complaint c) {
        Long citizenId = c.getUser() != null ? c.getUser().getId() : null;
        String citizenName = c.getUser() != null ? c.getUser().getName() : null;
        return new ComplaintResponse(
                c.getId(),
                c.getTicketCode(),
                c.getTicketCode(),
                citizenId,
                citizenName,
                c.getTitle(),
                c.getCategory(),
                c.getDescription(),
                c.getZone(),
                c.getLocation(),
                c.getLatitude(),
                c.getLongitude(),
                c.getPhotoUrl(),
                c.getPhotoUrl(),
                c.getStatus(),
                c.getPriority(),
                c.getDepartment(),
                c.getAssignedOfficer(),
                c.getAssignedAt(),
                c.getResolvedAt(),
                c.getResolutionNotes(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
