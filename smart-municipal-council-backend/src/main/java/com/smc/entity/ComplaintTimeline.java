package com.smc.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "complaint_timeline")
public class ComplaintTimeline {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    private String step;
    private String stepTime;
    private Boolean done;
    private Integer sequenceNo;
}