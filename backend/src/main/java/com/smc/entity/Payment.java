package com.smc.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "payments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_code", unique = true, nullable = false)
    private String billCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "passwordHash"})
    private User user;

    @Column(nullable = false)
    private String service;

    private String category;

    @Column(name = "assessment_no", nullable = false)
    private String assessmentNo;

    @Column(name = "billing_period")
    private String billingPeriod;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount = BigDecimal.ZERO; // Total Bill Amount

    // NEW: Track partial payments
    @Column(name = "amount_paid", precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO; 

    private String currency = "LKR";

    // Statuses: Pending, PENDING_VERIFICATION, Partially Paid, Paid, Overdue, Cancelled, Refunded
    @Column(nullable = false)
    private String status = "Pending";   

    @Column(name = "receipt_no")
    private String receiptNo;

    // NEW: For manual deposit slips
    @Column(name = "slip_data", columnDefinition = "TEXT")
    private String slipData;

    @Column(name = "txn_id")
    private String txnId;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "paid_at")
    private ZonedDateTime paidAt;

    @Column(name = "payer_name")
    private String payerName;

    @Column(name = "payer_phone")
    private String payerPhone;

    @Column(name = "order_id", unique = true)
    private String orderId;

    @Column(name = "gateway_ref")
    private String gatewayRef;

    @Column(name = "gateway_status")
    private String gatewayStatus;

    @Column(name = "created_at")
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();

    @PreUpdate
    void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}