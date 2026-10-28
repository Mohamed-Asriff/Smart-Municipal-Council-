-- Keep existing databases aligned with com.smc.entity.User.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64),
    ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMPTZ;
