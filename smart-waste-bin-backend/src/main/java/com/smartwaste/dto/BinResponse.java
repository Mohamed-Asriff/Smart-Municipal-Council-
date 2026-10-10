package com.smartwaste.dto;

import java.time.LocalDateTime;

public class BinResponse {
    private String id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String zone;
    private Double binHeightCm;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private Double latestFillPercentage;
    private Double latestDistanceCm;
    private LocalDateTime lastUpdated;
    
    public BinResponse() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    
    public Double getBinHeightCm() { return binHeightCm; }
    public void setBinHeightCm(Double binHeightCm) { this.binHeightCm = binHeightCm; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Double getLatestFillPercentage() { return latestFillPercentage; }
    public void setLatestFillPercentage(Double latestFillPercentage) { this.latestFillPercentage = latestFillPercentage; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public Double getLatestDistanceCm() { return latestDistanceCm; }
    public void setLatestDistanceCm(Double latestDistanceCm) { this.latestDistanceCm = latestDistanceCm; }
}
