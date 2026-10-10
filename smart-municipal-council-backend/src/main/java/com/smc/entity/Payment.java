package com.smc.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "payments")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_code", unique = true, nullable = false)
    private String billCode;

    @ManyToOne @JoinColumn(name = "user_id")
    private User user;

    private String service;
    private String category;

    @Column(name = "assessment_no") private String assessmentNo;
    @Column(name = "billing_period") private String billingPeriod;
    @Column(name = "due_date") private LocalDate dueDate;

    private BigDecimal amount;
    private String status;

    @Column(name = "receipt_no") private String receiptNo;
    @Column(name = "txn_id") private String txnId;

    @Column(name = "paid_at") private ZonedDateTime paidAt;
    @Column(name = "payment_method") private String paymentMethod;
}