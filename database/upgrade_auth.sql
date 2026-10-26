-- ============================================================================
-- Legacy Migration: Upgrade Auth
-- Note: You DO NOT need to run this if you ran the new schema.sql 
-- (v3.0) from scratch. This is only for upgrading old databases.
-- ============================================================================

-- Resolve duplicate phones on old test records so phone numbers are unique
UPDATE users SET phone = '+94 67 222 0262' WHERE id = 3;
UPDATE users SET phone = '+94 67 222 0263' WHERE id = 5;
UPDATE users SET phone = '+94 77 987 6544' WHERE id = 8;
UPDATE users SET phone = '+94 77 987 6545' WHERE id = 9;
UPDATE users SET phone = '+94 77 987 6546' WHERE id = 10;
UPDATE users SET phone = '+94 77 111 2222' WHERE id = 4;
UPDATE users SET phone = '+94 72 165 1216' WHERE id = 11;
UPDATE users SET phone = '+94 67 222 9999' WHERE id = 12;
UPDATE users SET phone = '+94 77 123 4599' WHERE id = 13;

-- Function/formula to normalize Sri Lankan phone:
UPDATE users SET phone_normalized = 
  CASE 
    WHEN phone IS NULL OR TRIM(phone) = '' THEN NULL
    ELSE (
      CASE 
        WHEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '0094%' 
          THEN '+' || SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 3)
        WHEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '94%' 
          THEN '+' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
        WHEN REGEXP_REPLACE(phone, '[^0-9]', '', 'g') LIKE '0%' 
          THEN '+94' || SUBSTRING(REGEXP_REPLACE(phone, '[^0-9]', '', 'g') FROM 2)
        WHEN LENGTH(REGEXP_REPLACE(phone, '[^0-9]', '', 'g')) = 9 
          THEN '+94' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
        ELSE '+' || REGEXP_REPLACE(phone, '[^0-9]', '', 'g')
      END
    )
  END;

-- Create unique index on phone_normalized
DROP INDEX IF EXISTS idx_users_phone_normalized;
CREATE UNIQUE INDEX idx_users_phone_normalized ON users (phone_normalized) WHERE phone_normalized IS NOT NULL;