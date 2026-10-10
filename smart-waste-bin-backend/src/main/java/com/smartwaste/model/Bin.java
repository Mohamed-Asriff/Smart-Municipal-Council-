package com.smartwaste.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="bins")
public class Bin {
    
    @Id
    private String id;
    private String name;
    private Double latitude;
    private Double longitude;
    private String zone;
    
    @Column(name="bin_height_cm", columnDefinition="DOUBLE PRECISION DEFAULT 40.0")
    private Double binHeightCm = 40.0;
    
    @Column(columnDefinition="VARCHAR(255) DEFAULT 'ACTIVE'")
    private String status = "ACTIVE";
    
    @Column(name="created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name="updated_at")
    private LocalDateTime updatedAt;
    
    public Bin() {}

    public Bin(String id, String name, Double latitude, Double longitude, String zone, Double binHeightCm, String status) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.zone = zone;
        if (binHeightCm != null) this.binHeightCm = binHeightCm;
        if (status != null) this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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
}
