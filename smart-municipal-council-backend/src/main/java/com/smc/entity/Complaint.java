package com.smc.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "complaints")
public class Complaint {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", unique = true, nullable = false)
    private String ticketCode;

    @ManyToOne @JoinColumn(name = "user_id")
    private User user;

    private String title;
    private String description;
    private String category;
    private String zone;
    private String location;
    private String priority;
    private String status;
    private String department;

    @Column(name = "assigned_officer") private String assignedOfficer;

    @Column(name = "submitted_at")
    private ZonedDateTime submittedAt = ZonedDateTime.now();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL)
    private List<ComplaintTimeline> timeline;
}