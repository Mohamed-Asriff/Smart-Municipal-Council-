package com.smc.controller;

import com.smc.entity.NewsArticle;
import com.smc.repository.NewsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {
    private final NewsRepository newsRepository;

    public NewsController(NewsRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    @GetMapping
    public ResponseEntity<List<NewsArticle>> getAllNews() {
        return ResponseEntity.ok(newsRepository.findByIsActiveTrueOrderByPublishedAtDesc());
    }
}