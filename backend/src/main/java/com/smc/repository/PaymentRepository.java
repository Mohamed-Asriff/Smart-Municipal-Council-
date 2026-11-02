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
           "(:assessmentNo IS NOT NULL AND TRIM(:assessmentNo) <> '' AND LOWER(p.assessmentNo) = LOWER(TRIM(:assessmentNo))) " +
           "ORDER BY p.dueDate DESC")
    List<Payment> findForCitizen(@Param("userId") Long userId, @Param("assessmentNo") String assessmentNo);

    List<Payment> findByAssessmentNoAndStatus(String assessmentNo, String status);

    java.util.Optional<Payment> findByOrderId(String orderId);

    java.util.Optional<Payment> findByBillCode(String billCode);

    // Admin KPI queries (including partially paid bills)
    @Query("SELECT COALESCE(SUM(" +
           "CASE " +
           "  WHEN UPPER(p.status) = 'PAID' THEN " +
           "    CASE WHEN p.amountPaid IS NOT NULL AND p.amountPaid > 0 THEN p.amountPaid ELSE p.amount END " +
           "  WHEN UPPER(p.status) = 'PARTIALLY PAID' THEN COALESCE(p.amountPaid, 0) " +
           "  ELSE COALESCE(p.amountPaid, 0) " +
           "END), 0) FROM Payment p WHERE UPPER(p.status) NOT IN ('CANCELLED', 'REFUNDED')")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(" +
           "CASE " +
           "  WHEN UPPER(p.status) IN ('PAID', 'CANCELLED', 'REFUNDED') THEN 0 " +
           "  ELSE CASE WHEN (p.amount - COALESCE(p.amountPaid, 0)) > 0 THEN (p.amount - COALESCE(p.amountPaid, 0)) ELSE 0 END " +
           "END), 0) FROM Payment p")
    BigDecimal calculatePendingCollections();

    @Query("SELECT COUNT(p) FROM Payment p WHERE UPPER(p.status) = 'PAID' OR UPPER(p.status) = 'PARTIALLY PAID' OR (p.amountPaid IS NOT NULL AND p.amountPaid > 0)")
    long countSuccessfulTransactions();

    long countByStatus(String status);
}
