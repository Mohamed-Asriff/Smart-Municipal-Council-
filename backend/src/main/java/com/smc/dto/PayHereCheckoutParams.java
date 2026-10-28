package com.smc.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PayHereCheckoutParams {
    @JsonProperty("merchant_id")
    private String merchantId;

    @JsonProperty("return_url")
    private String returnUrl;

    @JsonProperty("cancel_url")
    private String cancelUrl;

    @JsonProperty("notify_url")
    private String notifyUrl;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("address")
    private String address;

    @JsonProperty("city")
    private String city;

    @JsonProperty("country")
    private String country;

    @JsonProperty("order_id")
    private String orderId;

    @JsonProperty("items")
    private String items;

    @JsonProperty("currency")
    private String currency;

    @JsonProperty("amount")
    private String amount;

    @JsonProperty("hash")
    private String hash;

    @JsonProperty("action_url")
    private String actionUrl;

    private boolean sandbox;

    @JsonProperty("bill_code")
    private String billCode;

    private String service;
    private Long paymentId;

    public PayHereCheckoutParams() {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final PayHereCheckoutParams params = new PayHereCheckoutParams();

        public Builder merchantId(String merchantId) { params.merchantId = merchantId; return this; }
        public Builder returnUrl(String returnUrl) { params.returnUrl = returnUrl; return this; }
        public Builder cancelUrl(String cancelUrl) { params.cancelUrl = cancelUrl; return this; }
        public Builder notifyUrl(String notifyUrl) { params.notifyUrl = notifyUrl; return this; }
        public Builder firstName(String firstName) { params.firstName = firstName; return this; }
        public Builder lastName(String lastName) { params.lastName = lastName; return this; }
        public Builder email(String email) { params.email = email; return this; }
        public Builder phone(String phone) { params.phone = phone; return this; }
        public Builder address(String address) { params.address = address; return this; }
        public Builder city(String city) { params.city = city; return this; }
        public Builder country(String country) { params.country = country; return this; }
        public Builder orderId(String orderId) { params.orderId = orderId; return this; }
        public Builder items(String items) { params.items = items; return this; }
        public Builder currency(String currency) { params.currency = currency; return this; }
        public Builder amount(String amount) { params.amount = amount; return this; }
        public Builder hash(String hash) { params.hash = hash; return this; }
        public Builder actionUrl(String actionUrl) { params.actionUrl = actionUrl; return this; }
        public Builder sandbox(boolean sandbox) { params.sandbox = sandbox; return this; }
        public Builder billCode(String billCode) { params.billCode = billCode; return this; }
        public Builder service(String service) { params.service = service; return this; }
        public Builder paymentId(Long paymentId) { params.paymentId = paymentId; return this; }

        public PayHereCheckoutParams build() {
            return params;
        }
    }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }

    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }

    public String getNotifyUrl() { return notifyUrl; }
    public void setNotifyUrl(String notifyUrl) { this.notifyUrl = notifyUrl; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getItems() { return items; }
    public void setItems(String items) { this.items = items; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getAmount() { return amount; }
    public void setAmount(String amount) { this.amount = amount; }

    public String getHash() { return hash; }
    public void setHash(String hash) { this.hash = hash; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public boolean isSandbox() { return sandbox; }
    public void setSandbox(boolean sandbox) { this.sandbox = sandbox; }

    public String getBillCode() { return billCode; }
    public void setBillCode(String billCode) { this.billCode = billCode; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
}
