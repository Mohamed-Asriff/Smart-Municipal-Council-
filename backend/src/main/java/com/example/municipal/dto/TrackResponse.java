package com.example.municipal.dto;

import com.example.municipal.enums.ComplaintStatus;
import com.example.municipal.enums.Department;
import java.time.LocalDateTime;
import java.util.List;

public record TrackResponse(String ticketNo, String title, String location,
                            ComplaintStatus status, Department department,
                            LocalDateTime createdAt, List<HistoryItem> timeline) {}