package com.smc.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "notices")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "notice_type")
    private String noticeType;

    private String badge;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "published_at")
    private LocalDate publishedAt = LocalDate.now();

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
