package com.smc.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "complaint_timeline")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ComplaintTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    @JsonIgnore
    private Complaint complaint;

    @Column(nullable = false)
    private String step;

    @Column(name = "step_time")
    private String stepTime;

    @Column(nullable = false)
    private Boolean done = false;

    @Column(name = "sequence_no", nullable = false)
    private Integer sequenceNo;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
