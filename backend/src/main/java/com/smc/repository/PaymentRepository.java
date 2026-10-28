package com.smc.repository;

import com.smc.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserIdOrderByDueDateDesc(Long userId);

    // Citizen portal: find payments linked by user_id OR by matching assessmentNo
    @Query("SELECT p FROM Payment p WHERE p.user.id = :userId OR " +
           "(p.user IS NULL AND :assessmentNo IS NOT NULL AND p.assessmentNo = :assessmentNo) " +
           "ORDER BY p.dueDate DESC")
    List<Payment> findForCitizen(@Param("userId") Long userId, @Param("assessmentNo") String assessmentNo);

    List<Payment> findByAssessmentNoAndStatus(String assessmentNo, String status);

    java.util.Optional<Payment> findByOrderId(String orderId);

    java.util.Optional<Payment> findByBillCode(String billCode);

    // Admin KPI queries (from pay branch)
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'Paid'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'Pending'")
    BigDecimal calculatePendingCollections();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'Paid'")
    long countSuccessfulTransactions();

    long countByStatus(String status);
}
