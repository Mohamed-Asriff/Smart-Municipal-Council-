package com.smc.controller;

import com.smc.dto.PaymentRequest;
import com.smc.entity.Payment;
import com.smc.entity.User;
import com.smc.repository.PaymentRepository;
import com.smc.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PaymentController(PaymentRepository paymentRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getUserPayments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(paymentRepository.findByUserIdOrderByDueDateDesc(user.getId()));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Payment> submitPayment(@RequestBody PaymentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<Payment> pending = paymentRepository.findByAssessmentNoAndStatus(request.getAssessmentNo(), "Pending");
        
        if (!pending.isEmpty()) {
            Payment bill = pending.get(0);
            bill.setStatus("Paid");
            bill.setReceiptNo("REC-SMC-" + (int)(Math.random() * 900000 + 100000));
            bill.setTxnId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            bill.setPaidAt(ZonedDateTime.now());
            bill.setPaymentMethod("Digital Card / LankaPay");
            return ResponseEntity.ok(paymentRepository.save(bill));
        }

        Payment newPayment = new Payment();
        newPayment.setBillCode("BILL-" + System.currentTimeMillis());
        newPayment.setUser(user);
        newPayment.setService(request.getServiceType());
        newPayment.setCategory("Taxes");
        newPayment.setAssessmentNo(request.getAssessmentNo());
        newPayment.setAmount(new BigDecimal(request.getAmount()));
        newPayment.setStatus("Paid");
        newPayment.setReceiptNo("REC-SMC-" + (int)(Math.random() * 900000 + 100000));
        newPayment.setTxnId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        newPayment.setPaidAt(ZonedDateTime.now());
        newPayment.setPaymentMethod("Digital Card");

        return ResponseEntity.ok(paymentRepository.save(newPayment));
    }
}