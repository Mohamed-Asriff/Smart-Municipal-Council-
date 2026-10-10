package com.example.municipal.dto;

import com.example.municipal.entity.Complaint;
import com.example.municipal.enums.Category;
import com.example.municipal.enums.ComplaintStatus;
import com.example.municipal.enums.Department;
import com.example.municipal.enums.Priority;
import java.time.LocalDateTime;

public record ComplaintResponse(
        Long id, String ticketNo, Long citizenId, String title, Category category,
        String description, String location, Double latitude, Double longitude,
        String imageUrl, ComplaintStatus status, Priority priority, Department department,
        LocalDateTime assignedAt, LocalDateTime resolvedAt, String resolutionNotes,
        LocalDateTime createdAt, LocalDateTime updatedAt) {

    public static ComplaintResponse from(Complaint c) {
        return new ComplaintResponse(c.getId(), c.getTicketNo(), c.getCitizenId(),
                c.getTitle(), c.getCategory(), c.getDescription(), c.getLocation(),
                c.getLatitude(), c.getLongitude(), c.getImageUrl(), c.getStatus(),
                c.getPriority(), c.getDepartment(), c.getAssignedAt(), c.getResolvedAt(),
                c.getResolutionNotes(), c.getCreatedAt(), c.getUpdatedAt());
    }
}