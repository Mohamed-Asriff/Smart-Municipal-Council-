package com.smc.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "news_articles")
public class NewsArticle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String category;
    private String summary;
    private String author;
    @Column(name = "published_at") private LocalDate publishedAt;
    @Column(name = "is_active") private Boolean isActive = true;
}