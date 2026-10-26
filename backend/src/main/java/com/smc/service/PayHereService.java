package com.smc.service;

import com.smc.dto.PayHereCheckoutParams;
import com.smc.entity.Payment;
import com.smc.entity.User;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

@Slf4j
@Service
public class PayHereService {

    @Getter
    @Value("${payhere.merchant-id:1229999}")
    private String merchantId;

    @Value("${payhere.merchant-secret:4XXXXXXXXXX}")
    private String merchantSecret;

    @Getter
    @Value("${payhere.sandbox:true}")
    private boolean sandbox;

    @Getter
    @Value("${payhere.checkout-url:https://sandbox.payhere.lk/pay/checkout}")
    private String checkoutUrl;

    @Value("${payhere.notify-url:http://localhost:8080/api/payments/payhere/notify}")
    private String notifyUrl;

    @Value("${payhere.return-url:http://localhost:5173}")
    private String returnUrl;

    @Value("${payhere.cancel-url:http://localhost:5173}")
    private String cancelUrl;

    /**
     * Compute MD5 hash and return uppercase 32-character hex string.
     */
    public String getMd5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            BigInteger no = new BigInteger(1, messageDigest);
            StringBuilder hashtext = new StringBuilder(no.toString(16));
            while (hashtext.length() < 32) {
                hashtext.insert(0, "0");
            }
            return hashtext.toString().toUpperCase();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 algorithm not available", e);
        }
    }

    /**
     * Format monetary amount to exact 2 decimal places (e.g. 1000.00).
     */
    public String formatAmount(BigDecimal amount) {
        if (amount == null) amount = BigDecimal.ZERO;
        DecimalFormat df = new DecimalFormat("0.00", DecimalFormatSymbols.getInstance(Locale.US));
        return df.format(amount);
    }

    /**
     * Official PayHere Checksum generation for Checkout API:
     * hash = strtoupper(md5(merchant_id + order_id + amountFormatted + currency + strtoupper(md5(merchant_secret))))
     */
    public String generateCheckoutHash(String orderId, BigDecimal amount, String currency) {
        String formatted = formatAmount(amount);
        String hashedSecret = getMd5(merchantSecret);
        String raw = merchantId + orderId + formatted + currency + hashedSecret;
        return getMd5(raw);
    }

    /**
     * Official PayHere Checksum verification for IPN Server Callback:
     * md5sig = strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
     */
    public boolean verifyNotificationChecksum(String orderId, String payhereAmount, String payhereCurrency, String statusCode, String md5sig) {
        return verifyNotificationChecksum(this.merchantId, orderId, payhereAmount, payhereCurrency, statusCode, md5sig);
    }

    public boolean verifyNotificationChecksum(String merchantId, String orderId, String payhereAmount, String payhereCurrency, String statusCode, String md5sig) {
        if (merchantId == null || !merchantId.trim().equals(this.merchantId)
                || orderId == null || payhereAmount == null || payhereCurrency == null || statusCode == null || md5sig == null) {
            log.warn("PayHere notification verification failed: missing required parameter(s) or merchant_id mismatch");
            return false;
        }

        String hashedSecret = getMd5(merchantSecret);
        String raw = merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret;
        String localMd5sig = getMd5(raw);

        boolean matches = localMd5sig.equalsIgnoreCase(md5sig.trim());
        if (!matches) {
            log.warn("PayHere notification checksum mismatch for orderId: {}", orderId);
        }
        return matches;
    }

    /**
     * Build the checkout payload containing all required fields to redirect citizen to PayHere gateway.
     */
    public PayHereCheckoutParams buildCheckoutParams(Payment payment, User user) {
        String currency = payment.getCurrency() != null ? payment.getCurrency() : "LKR";
        String hash = generateCheckoutHash(payment.getOrderId(), payment.getAmount(), currency);

        String fullName = payment.getPayerName() != null ? payment.getPayerName() : (user != null ? user.getName() : "Citizen");
        String[] nameParts = fullName.trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "KMC";

        String email = user != null && user.getEmail() != null ? user.getEmail() : "info@kalmunaimc.gov.lk";
        String phone = payment.getPayerPhone() != null ? payment.getPayerPhone() : (user != null && user.getPhone() != null ? user.getPhone() : "0771234567");
        String address = user != null && user.getAddress() != null ? user.getAddress() : "Main Street, Kalmunai";
        String city = user != null && user.getZone() != null ? user.getZone() : "Kalmunai";

        return PayHereCheckoutParams.builder()
                .merchantId(merchantId)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .notifyUrl(notifyUrl)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phone(phone)
                .address(address)
                .city(city)
                .country("Sri Lanka")
                .orderId(payment.getOrderId())
                .items(payment.getService() + " (" + payment.getBillCode() + ")")
                .currency(currency)
                .amount(formatAmount(payment.getAmount()))
                .hash(hash)
                .actionUrl(checkoutUrl)
                .sandbox(sandbox)
                .billCode(payment.getBillCode())
                .service(payment.getService())
                .paymentId(payment.getId())
                .build();
    }
}
