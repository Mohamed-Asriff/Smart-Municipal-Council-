package com.smc.repository;
import com.smc.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByDueDateDesc(Long userId);
    List<Payment> findByAssessmentNoAndStatus(String assessmentNo, String status);
}