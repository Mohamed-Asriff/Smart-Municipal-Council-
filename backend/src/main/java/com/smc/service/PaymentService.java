package com.smc.service;

import com.smc.dto.*;
import com.smc.entity.Payment;
import com.smc.entity.User;
import com.smc.repository.PaymentRepository;
import com.smc.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@SuppressWarnings("null") // <--- This tells VS Code to ignore those specific null-safety warnings
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    public List<Payment> getPaymentsByUserId(Long userId) {
        return paymentRepository.findByUserIdOrderByDueDateDesc(userId);
    }

    @Transactional
    public Payment checkout(PaymentCheckoutRequest request, User user) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        BigDecimal currentPaid = payment.getAmountPaid() != null ? payment.getAmountPaid() : BigDecimal.ZERO;
        BigDecimal newTotalPaid = currentPaid.add(request.getAmount());
        
        payment.setAmountPaid(newTotalPaid);
        payment.setPaymentMethod(request.getPaymentMethod());

        if (newTotalPaid.compareTo(payment.getAmount()) >= 0) {
            payment.setStatus("Paid");
            payment.setReceiptNo("REC-KMC-" + (System.currentTimeMillis() % 1000000));
            payment.setPaidAt(ZonedDateTime.now());
        } else {
            payment.setStatus("Partially Paid");
        }
        
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processManualPayment(PaymentCheckoutRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment/ Bill not found."));

        BigDecimal currentPaid = payment.getAmountPaid() != null ? payment.getAmountPaid() : BigDecimal.ZERO;
        
        // Only throw error if the MATH says it's fully paid, ignore the status text
        if (currentPaid.compareTo(payment.getAmount()) >= 0) {
            throw new RuntimeException("This bill has already been fully paid.");
        }

        payment.setStatus("PENDING_VERIFICATION"); 
        payment.setSlipData(request.getSlipData()); 
        payment.setAmountPaid(currentPaid.add(request.getAmount())); 
        payment.setPaymentMethod("Bank Transfer");
        payment.setPayerName(request.getPayerName() != null ? request.getPayerName() : "Citizen");
        
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment updatePaymentStatus(Long paymentId, String newStatus) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if ("Paid".equalsIgnoreCase(newStatus)) {
            if (payment.getAmountPaid() == null) payment.setAmountPaid(BigDecimal.ZERO);

            // Check if the amount paid covers the total amount
            if (payment.getAmountPaid().compareTo(payment.getAmount()) >= 0) {
                payment.setStatus("Paid");
                if (payment.getReceiptNo() == null) {
                    payment.setReceiptNo("REC-KMC-" + (System.currentTimeMillis() % 1000000));
                }
                payment.setPaidAt(ZonedDateTime.now());
            } else {
                payment.setStatus("Partially Paid"); // Set to Partially Paid if balance remains
            }
        } else if ("Pending".equalsIgnoreCase(newStatus)) {
            payment.setStatus("Pending");
            payment.setSlipData(null);
            payment.setAmountPaid(BigDecimal.ZERO); 
        }

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment issueNewBill(IssueBillRequest req) {
        Payment payment = new Payment();
        payment.setBillCode("BILL-" + java.time.Year.now().getValue() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setService(req.getService());
        payment.setCategory(req.getCategory());
        payment.setAssessmentNo(req.getAssessmentNo());
        payment.setBillingPeriod(req.getBillingPeriod());
        payment.setDueDate(req.getDueDate());
        payment.setAmount(req.getAmount());
        payment.setAmountPaid(BigDecimal.ZERO);
        payment.setStatus("Pending");
        payment.setPayerName(req.getPayerName());
        payment.setPayerPhone(req.getPayerPhone());

        User user = userRepository.findByAssessmentNoIgnoreCase(req.getAssessmentNo()).orElse(null);
        if (user == null) {
            throw new RuntimeException("No citizen found with Assessment No: " + req.getAssessmentNo());
        }
        payment.setUser(user);

        return paymentRepository.save(payment);
    }

    public AdminKpiResponse getAdminKPIs() {
        BigDecimal totalRev = paymentRepository.calculateTotalRevenue();
        BigDecimal pendingCol = paymentRepository.calculatePendingCollections();
        long successTxns = paymentRepository.countSuccessfulTransactions();
        long totalTxns = paymentRepository.count();
        
        String successRate = totalTxns > 0 
            ? String.format("%.1f%%", ((double) successTxns / totalTxns) * 100) 
            : "0%";

        if (totalRev == null) totalRev = BigDecimal.ZERO;
        if (pendingCol == null) pendingCol = BigDecimal.ZERO;

        return new AdminKpiResponse(totalRev, pendingCol, successTxns, totalTxns, successRate);
    }

    public List<Payment> getAllTransactions() {
        return paymentRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public List<Payment> getPendingPaymentsByCitizen(String citizenId) {
        return paymentRepository.findByAssessmentNoAndStatus(citizenId, "Pending");
    }

    public List<Payment> getPaymentHistoryByCitizen(String citizenId) {
        return paymentRepository.findByAssessmentNoAndStatus(citizenId, "Paid");
    }

    @Transactional
    public Payment processPayment(Long paymentId) {
        return updatePaymentStatus(paymentId, "Paid");
    }

    public PayHereCheckoutParams initiatePayHerePayment(Long paymentId, String billCode, User user) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return PayHereCheckoutParams.builder()
                .orderId("ORDER-" + payment.getId())
                .amount(payment.getAmount().toString())
                .items(payment.getService())
                .build();
    }

    public void handlePayHereNotification(Map<String, String> params) {
        String orderId = params.get("order_id");
        String statusCode = params.get("status_code");
        if (orderId != null && "2".equals(statusCode)) {
            paymentRepository.findByOrderId(orderId).ifPresent(payment -> {
                payment.setStatus("Paid");
                payment.setAmountPaid(payment.getAmount());
                payment.setGatewayRef(params.get("payment_id"));
                payment.setPaidAt(ZonedDateTime.now());
                paymentRepository.save(payment);
            });
        }
    }

    public Payment getPaymentByOrderId(String orderId, User user) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
}