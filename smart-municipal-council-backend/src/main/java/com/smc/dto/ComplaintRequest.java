package com.smc.dto;
import lombok.Data;

@Data
public class ComplaintRequest {
    private String title;
    private String category;
    private String zone;
    private String location;
    private String description;
    private String priority;
}