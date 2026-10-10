package com.example.municipal.repository;

import com.example.municipal.entity.Complaint;
import com.example.municipal.enums.ComplaintStatus;
import com.example.municipal.enums.Department;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    Optional<Complaint> findByTicketNo(String ticketNo);

    long countByStatus(ComplaintStatus status);

    @Query("""
        select c from Complaint c
        where (:hasStatus = false or c.status = :status)
          and (:hasDepartment = false or c.department = :department)
          and (lower(c.ticketNo) like lower(concat('%', :q, '%'))
               or lower(c.title) like lower(concat('%', :q, '%')))
        """)
    Page<Complaint> search(@Param("hasStatus") boolean hasStatus,
                           @Param("status") ComplaintStatus status,
                           @Param("hasDepartment") boolean hasDepartment,
                           @Param("department") Department department,
                           @Param("q") String q,
                           Pageable pageable);
}