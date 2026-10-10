package com.smc.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_code", unique = true, nullable = false)
    private String userCode;

    @Column(nullable = false) private String name;
    @Column(unique = true, nullable = false) private String email;
    private String phone;
    private String nic;

    @Column(name = "password_hash", nullable = false)
    @JsonIgnore
    private String passwordHash;

    private String role = "CITIZEN";
    private String zone;
    private String address;

    @Column(name = "assessment_no") private String assessmentNo;
    private String status = "Verified Citizen";

    @Column(name = "created_at") private ZonedDateTime createdAt = ZonedDateTime.now();
    
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }

    public boolean isOfficerOrAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role) || "OFFICER".equalsIgnoreCase(this.role);
    }
}