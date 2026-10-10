package com.smartwaste.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="readings", indexes = {
    @Index(name = "idx_bin_id", columnList = "bin_id"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
public class Reading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name="bin_id")
    private String binId;
    
    @Column(name="fill_percentage")
    private Double fillPercentage;
    
    @Column(name="distance_cm")
    private Double distanceCm;
    
    private String status;
    
    private LocalDateTime timestamp;
    
    public Reading() {}
    
    public Reading(String binId, Double fillPercentage, Double distanceCm, LocalDateTime timestamp, String status) {
        this.binId = binId;
        this.fillPercentage = fillPercentage;
        this.distanceCm = distanceCm;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBinId() { return binId; }
    public void setBinId(String binId) { this.binId = binId; }

    public Double getFillPercentage() { return fillPercentage; }
    public void setFillPercentage(Double fillPercentage) { this.fillPercentage = fillPercentage; }

    public Double getDistanceCm() { return distanceCm; }
    public void setDistanceCm(Double distanceCm) { this.distanceCm = distanceCm; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
