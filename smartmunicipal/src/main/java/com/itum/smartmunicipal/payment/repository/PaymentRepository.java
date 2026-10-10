package com.itum.smartmunicipal.payment.repository;

import com.itum.smartmunicipal.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Citizen සඳහා අදාල ගෙවීම් ලබා ගැනීම
    List<Payment> findByCitizenIdOrderByPaymentDateDesc(String citizenId);
    List<Payment> findByCitizenIdAndStatus(String citizenId, String status);

    // Admin KPIs සඳහා Queries
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double calculateTotalRevenue();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'PENDING'")
    Double calculatePendingCollections();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'SUCCESS'")
    long countSuccessfulTransactions();
}