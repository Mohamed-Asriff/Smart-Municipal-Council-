package com.itum.smartmunicipal.payment.controller;

import com.itum.smartmunicipal.payment.entity.Payment;
import com.itum.smartmunicipal.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // 1. Get Pending Payments for a specific Citizen
    @GetMapping("/citizen/{citizenId}/pending")
    public ResponseEntity<List<Payment>> getPendingPayments(@PathVariable String citizenId) {
        return ResponseEntity.ok(paymentService.getPendingPaymentsByCitizen(citizenId));
    }

    // 2. Get Payment History for a specific Citizen
    @GetMapping("/citizen/{citizenId}/history")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable String citizenId) {
        return ResponseEntity.ok(paymentService.getPaymentHistoryByCitizen(citizenId));
    }

    // 3. Process a Payment (Triggered by 'Pay Now' button)
    @PutMapping("/process/{paymentId}")
    public ResponseEntity<Payment> processPayment(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.processPayment(paymentId));
    }

    // 4. Admin - Get All Transactions (Ledger)
    @GetMapping("/admin/all")
    public ResponseEntity<List<Payment>> getAllTransactions() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }

    // 5. Admin - Get KPI Data for Dashboard
    @GetMapping("/admin/kpis")
    public ResponseEntity<Map<String, Object>> getAdminKPIs() {
        return ResponseEntity.ok(paymentService.getAdminKPIs());
    }

    // 6. Endpoint to issue new bills from the Admin dashboard
    @PostMapping("/admin/issue")
    public ResponseEntity<?> issueNewBill(@RequestBody Payment payment) {
        // Set default status for a new bill
        payment.setStatus("PENDING");

        // Generate a random transaction ID for the pending bill
        payment.setTransactionId("#TXN-PEN-" + (int)(Math.random() * 100000));

        // Save to database using the PaymentService
        Payment savedPayment = paymentService.savePayment(payment);

        return ResponseEntity.ok(savedPayment);
    }
}