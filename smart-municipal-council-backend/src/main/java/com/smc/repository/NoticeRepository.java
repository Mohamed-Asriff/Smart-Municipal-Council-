package com.smc.repository;
import com.smc.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByIsActiveTrueOrderByPublishedAtDesc();
}