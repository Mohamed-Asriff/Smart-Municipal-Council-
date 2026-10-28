package com.smc.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "complaints")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", unique = true, nullable = false)
    private String ticketCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    private String zone;
    private String location;

    // From comp branch: GPS coordinates
    private Double latitude;
    private Double longitude;

    @Column(nullable = false)
    private String priority = "Medium";   // Low | Medium | High | Critical

    @Column(nullable = false)
    private String status = "Submitted";  // Submitted|In Progress|Dispatched|Resolved|Rejected|Closed

    private String department;

    @Column(name = "assigned_officer")
    private String assignedOfficer;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "ai_classified")
    private Boolean aiClassified = false;

    // From comp branch: resolution details
    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "assigned_at")
    private ZonedDateTime assignedAt;

    @Column(name = "resolved_at")
    private ZonedDateTime resolvedAt;

    @Column(name = "submitted_at")
    private ZonedDateTime submittedAt = ZonedDateTime.now();

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    // Simple step-based timeline (for citizen view)
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<ComplaintTimeline> timeline;

    // Full audit history (from comp branch)
    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("history-complaint")
    private List<ComplaintStatusHistory> statusHistory;

    @PreUpdate
    void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
