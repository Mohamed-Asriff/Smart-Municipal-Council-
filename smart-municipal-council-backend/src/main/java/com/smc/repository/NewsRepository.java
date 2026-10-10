package com.smc.repository;
import com.smc.entity.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NewsRepository extends JpaRepository<NewsArticle, Long> {
    List<NewsArticle> findByIsActiveTrueOrderByPublishedAtDesc();
}