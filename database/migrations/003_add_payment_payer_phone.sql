-- Keep existing payment records aligned with com.smc.entity.Payment.
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payer_phone VARCHAR(30);
