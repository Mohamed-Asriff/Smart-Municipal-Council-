package com.smc.repository;

import com.smc.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserIdOrderBySubmittedAtDesc(Long userId);

    Optional<Complaint> findByTicketCodeIgnoreCase(String ticketCode);

    long countByStatus(String status);

    // Paginated admin search: filter by status, category, and free-text
    @Query("""
        SELECT c FROM Complaint c
        WHERE (:filterStatus = false OR c.status = :status)
          AND (:filterCategory = false OR c.category = :category)
          AND (
               LOWER(c.title)       LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(c.ticketCode)  LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(c.location)    LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(c.category)    LIKE LOWER(CONCAT('%', :q, '%'))
          )
        """)
    Page<Complaint> search(
            @Param("filterStatus")   boolean filterStatus,
            @Param("status")         String status,
            @Param("filterCategory") boolean filterCategory,
            @Param("category")       String category,
            @Param("q")              String q,
            Pageable pageable
    );
}
