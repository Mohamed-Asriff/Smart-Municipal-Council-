package com.example.municipal.dto;

import com.example.municipal.enums.ComplaintStatus;
import java.time.LocalDateTime;

public record HistoryItem(ComplaintStatus status, String note, LocalDateTime changedAt) {}