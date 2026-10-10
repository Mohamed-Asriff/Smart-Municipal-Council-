-- ============================================================================
-- Kalmunai Municipal Council - Smart Governance Platform
-- PostgreSQL Database Schema (v1.0)
-- Compatible with PostgreSQL 15+
-- ============================================================================

-- Drop existing objects (for clean re-run)
DROP TABLE IF EXISTS complaint_timeline CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS complaint_status CASCADE;
DROP TYPE IF EXISTS complaint_priority CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('CITIZEN', 'OFFICER', 'ADMIN');

CREATE TYPE complaint_status AS ENUM (
    'Submitted',
    'In Progress',
    'Dispatched',
    'Resolved',
    'Rejected',
    'Closed'
);

CREATE TYPE complaint_priority AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);

CREATE TYPE payment_status AS ENUM ('Pending', 'Paid', 'Overdue', 'Cancelled', 'Refunded');

-- ============================================================================
-- TABLE: users  (Citizens, Officers, Admins)
-- ============================================================================

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    user_code       VARCHAR(32) UNIQUE NOT NULL,             -- e.g. USR-KMC-9042
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(180) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    nic             VARCHAR(20) UNIQUE,                      -- Sri Lankan NIC
    password_hash   VARCHAR(255) NOT NULL,                   -- BCrypt hash from Spring Boot
    role            user_role NOT NULL DEFAULT 'CITIZEN',
    zone            VARCHAR(120),                            -- Administrative Ward
    address         TEXT,
    assessment_no   VARCHAR(50),                             -- e.g. KMC-TAX-2026-9041
    avatar_url      TEXT,
    status          VARCHAR(50) DEFAULT 'Verified Citizen',
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (LOWER(email));
CREATE INDEX idx_users_nic   ON users (nic);
CREATE INDEX idx_users_zone  ON users (zone);

-- ============================================================================
-- TABLE: complaints  (Citizen complaints / tickets)
-- ============================================================================

CREATE TABLE complaints (
    id                  BIGSERIAL PRIMARY KEY,
    ticket_code         VARCHAR(32) UNIQUE NOT NULL,         -- e.g. KMC-2026-8492
    user_id             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(120) NOT NULL,
    zone                VARCHAR(120),
    location            VARCHAR(255),
    priority            complaint_priority NOT NULL DEFAULT 'Medium',
    status              complaint_status NOT NULL DEFAULT 'Submitted',
    department          VARCHAR(150),
    assigned_officer    VARCHAR(150),
    photo_url           TEXT,                                -- uploaded evidence
    ai_classified       BOOLEAN DEFAULT TRUE,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_user     ON complaints (user_id);
CREATE INDEX idx_complaints_status   ON complaints (status);
CREATE INDEX idx_complaints_zone     ON complaints (zone);
CREATE INDEX idx_complaints_category ON complaints (category);
CREATE INDEX idx_complaints_ticket   ON complaints (ticket_code);
CREATE INDEX idx_complaints_submitted_at ON complaints (submitted_at DESC);

-- ============================================================================
-- TABLE: complaint_timeline  (Step-by-step history for each complaint)
-- ============================================================================

CREATE TABLE complaint_timeline (
    id              BIGSERIAL PRIMARY KEY,
    complaint_id    BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    step            VARCHAR(255) NOT NULL,
    step_time       VARCHAR(80),                             -- e.g. "Sep 14, 09:15" (kept as string to match UI)
    done            BOOLEAN NOT NULL DEFAULT FALSE,
    sequence_no     INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_complaint ON complaint_timeline (complaint_id, sequence_no);

-- ============================================================================
-- TABLE: payments  (Bills & e-receipts)
-- ============================================================================

CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    bill_code       VARCHAR(32) UNIQUE NOT NULL,             -- e.g. BILL-2026-Q3-01
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    service         VARCHAR(150) NOT NULL,                   -- Property Assessment Tax
    category        VARCHAR(80),                             -- Taxes / Licenses / Utilities
    assessment_no   VARCHAR(50) NOT NULL,
    billing_period  VARCHAR(80),
    due_date        DATE,
    amount          NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    currency        VARCHAR(8) DEFAULT 'LKR',
    status          payment_status NOT NULL DEFAULT 'Pending',
    receipt_no      VARCHAR(50),                             -- e.g. REC-KMC-994201
    txn_id          VARCHAR(50),                             -- LankaPay transaction ref
    payment_method  VARCHAR(80),                             -- Card / Online Banking / LankaPay
    paid_at         TIMESTAMPTZ,
    payer_name      VARCHAR(150),
    payer_phone     VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user     ON payments (user_id);
CREATE INDEX idx_payments_status   ON payments (status);
CREATE INDEX idx_payments_assess   ON payments (assessment_no);
CREATE INDEX idx_payments_due_date ON payments (due_date);

-- ============================================================================
-- TABLE: notices  (Public notices shown in Citizen Portal)
-- ============================================================================

CREATE TABLE notices (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    notice_type     VARCHAR(80),                             -- Financial, Public Works, Service
    badge           VARCHAR(50),
    summary         TEXT,
    published_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notices_active ON notices (is_active, published_at DESC);

-- ============================================================================
-- TABLE: news_articles  (Announcements section on landing page)
-- ============================================================================

CREATE TABLE news_articles (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    category        VARCHAR(120),
    summary         TEXT,
    author          VARCHAR(150),
    published_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_active ON news_articles (is_active, published_at DESC);

-- ============================================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_complaints_updated
    BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- VIEW: citizen_dashboard_summary  (Optional convenience view)
-- ============================================================================

CREATE OR REPLACE VIEW citizen_dashboard_summary AS
SELECT
    u.id                                       AS user_id,
    u.user_code,
    u.name,
    u.zone,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status <> 'Resolved') AS active_complaints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'Resolved')  AS resolved_complaints,
    COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'Pending'), 0) AS total_due,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'Pending')   AS pending_bills
FROM users u
LEFT JOIN complaints c ON c.user_id = u.id
LEFT JOIN payments  p ON p.user_id = u.id
GROUP BY u.id, u.user_code, u.name, u.zone;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================