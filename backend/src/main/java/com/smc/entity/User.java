package com.smc.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_code", unique = true, nullable = false)
    private String userCode;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    @Column(name = "phone_normalized", unique = true)
    private String phoneNormalized;

    private String nic;

    @Column(name = "reset_token")
    @JsonIgnore
    private String resetToken;

    @Column(name = "reset_token_expiry")
    @JsonIgnore
    private ZonedDateTime resetTokenExpiry;

    @Column(name = "password_hash", nullable = false)
    @JsonIgnore
    private String passwordHash;

    @Column(nullable = false)
    private String role = "CITIZEN";   // CITIZEN | OFFICER | ADMIN

    private String zone;
    private String address;

    @Column(name = "assessment_no")
    private String assessmentNo;

    @Column(name = "avatar_url")
    private String avatarUrl;

    private String status = "Verified Citizen";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    // Convenience role checks
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }

    public boolean isOfficerOrAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role) || "OFFICER".equalsIgnoreCase(this.role);
    }
}
