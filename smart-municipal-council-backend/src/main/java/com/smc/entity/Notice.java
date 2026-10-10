package com.smc.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "notices")
public class Notice {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(name = "notice_type") private String noticeType;
    private String badge;
    private String summary;
    @Column(name = "published_at") private LocalDate publishedAt;
    @Column(name = "is_active") private Boolean isActive = true;
}