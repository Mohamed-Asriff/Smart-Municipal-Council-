package com.smc.controller;

import com.smc.dto.AdminKpiResponse;
import com.smc.dto.IssueBillRequest;
import com.smc.dto.PaymentCheckoutRequest;
import com.smc.dto.PayHereCheckoutParams;
import com.smc.dto.PayHereInitiateRequest;
import com.smc.entity.Payment;
import com.smc.entity.User;
import com.smc.repository.UserRepository;
import com.smc.service.PaymentService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    // ================= CITIZEN PAYMENT PORTAL =================

    @GetMapping
    public ResponseEntity<List<Payment>> getUserPayments() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(user.getId()));
    }

    // Standard Checkout (Card / QR)
    @PostMapping("/checkout")
    public ResponseEntity<Payment> checkout(@RequestBody PaymentCheckoutRequest request) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(paymentService.checkout(request, user));
    }

    // NEW: Manual Bank Slip Upload (Accepts JSON with Base64 String)
    @PostMapping("/manual-checkout")
    public ResponseEntity<?> manualCheckout(@RequestBody PaymentCheckoutRequest request) {
        User user = getAuthenticatedUser();
        if (user == null) return ResponseEntity.status(401).build();

        if (request.getSlipData() == null || request.getSlipData().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Deposit slip image is required."));
        }

        try {
            Payment payment = paymentService.processManualPayment(request);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ================= PAYHERE ONLINE GATEWAY =================

    @PostMapping("/initiate")
    public ResponseEntity<PayHereCheckoutParams> initiatePayHere(@RequestBody PayHereInitiateRequest request) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(paymentService.initiatePayHerePayment(request.getPaymentId(), request.getBillCode(), user));
    }

    @PostMapping(value = "/payhere/notify", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> payHereNotify(@RequestParam Map<String, String> params) {
        paymentService.handlePayHereNotification(params);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/order/{orderId}/status")
    public ResponseEntity<Payment> getOrderStatus(@PathVariable String orderId) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId, user));
    }

    @GetMapping("/{paymentId}/status")
    public ResponseEntity<Payment> getPaymentStatus(@PathVariable Long paymentId) {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        Payment payment = paymentService.getPaymentsByUserId(user.getId()).stream()
                .filter(p -> p.getId().equals(paymentId))
                .findFirst()
                .orElse(null);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payment);
    }

    // ================= PAY BRANCH COMPATIBILITY =================

    @GetMapping("/citizen/{citizenId}/pending")
    public ResponseEntity<List<Payment>> getPendingPayments(@PathVariable String citizenId) {
        return ResponseEntity.ok(paymentService.getPendingPaymentsByCitizen(citizenId));
    }

    @GetMapping("/citizen/{citizenId}/history")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable String citizenId) {
        return ResponseEntity.ok(paymentService.getPaymentHistoryByCitizen(citizenId));
    }

    @PutMapping("/process/{paymentId}")
    public ResponseEntity<Payment> processPayment(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.processPayment(paymentId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<Payment>> getAllTransactions() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }

    @GetMapping("/admin/kpis")
    public ResponseEntity<AdminKpiResponse> getAdminKPIs() {
        return ResponseEntity.ok(paymentService.getAdminKPIs());
    }

    @PostMapping("/admin/issue")
    public ResponseEntity<Payment> issueNewBill(@RequestBody IssueBillRequest req) {
        return ResponseEntity.ok(paymentService.issueNewBill(req));
    }
}