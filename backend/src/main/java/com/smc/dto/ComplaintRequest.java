package com.smc.dto;

import lombok.Data;

@Data
public class ComplaintRequest {
    private String title;
    private String category;
    private String description;
    private String zone;
    private String location;
    private Double latitude;
    private Double longitude;
    private String priority;
    private String department;
}
