-- ============================================================================
-- Kalmunai Municipal Council - Smart Governance Platform
-- Unified PostgreSQL Database Schema (v3.0)
-- ============================================================================

-- Drop existing objects (for clean re-run)
DROP VIEW IF EXISTS citizen_dashboard_summary CASCADE;
DROP TABLE IF EXISTS complaint_status_history CASCADE;
DROP TABLE IF EXISTS complaint_timeline CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS readings CASCADE;
DROP TABLE IF EXISTS bins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- TABLE: users
-- ============================================================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    user_code       VARCHAR(32) UNIQUE NOT NULL,
    name            VARCHAR(150) NOT NULL,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(180) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    phone_normalized VARCHAR(20) UNIQUE,
    nic             VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'CITIZEN',
    zone            VARCHAR(120),
    address         TEXT,
    assessment_no   VARCHAR(50),
    avatar_url      TEXT,
    status          VARCHAR(50) DEFAULT 'Verified Citizen',
    is_active       BOOLEAN DEFAULT TRUE,
    reset_token     VARCHAR(64),
    reset_token_expiry TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (LOWER(email));
CREATE INDEX idx_users_nic   ON users (nic);
CREATE INDEX idx_users_zone  ON users (zone);

-- ============================================================================
-- TABLE: complaints
-- ============================================================================
CREATE TABLE complaints (
    id                  BIGSERIAL PRIMARY KEY,
    ticket_code         VARCHAR(32) UNIQUE NOT NULL,
    user_id             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(120) NOT NULL,
    zone                VARCHAR(120),
    location            VARCHAR(255),
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    priority            VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',  
    status              VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    department          VARCHAR(150),
    assigned_officer    VARCHAR(150),
    photo_url           TEXT,
    ai_classified       BOOLEAN DEFAULT FALSE,
    resolution_notes    TEXT,
    assigned_at         TIMESTAMPTZ,
    resolved_at         TIMESTAMPTZ,
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_user        ON complaints (user_id);
CREATE INDEX idx_complaints_status      ON complaints (status);
CREATE INDEX idx_complaints_zone        ON complaints (zone);
CREATE INDEX idx_complaints_category    ON complaints (category);
CREATE INDEX idx_complaints_ticket      ON complaints (ticket_code);
CREATE INDEX idx_complaints_submitted   ON complaints (submitted_at DESC);

-- ============================================================================
-- TABLE: complaint_timeline
-- ============================================================================
CREATE TABLE complaint_timeline (
    id              BIGSERIAL PRIMARY KEY,
    complaint_id    BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    step            VARCHAR(255) NOT NULL,
    step_time       VARCHAR(80),
    done            BOOLEAN NOT NULL DEFAULT FALSE,
    sequence_no     INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_complaint ON complaint_timeline (complaint_id, sequence_no);

-- ============================================================================
-- TABLE: complaint_status_history
-- ============================================================================
CREATE TABLE complaint_status_history (
    id              BIGSERIAL PRIMARY KEY,
    complaint_id    BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    status          VARCHAR(30) NOT NULL,
    note            TEXT,
    changed_by      VARCHAR(100),
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_history_complaint ON complaint_status_history (complaint_id, changed_at);

-- ============================================================================
-- TABLE: payments
-- ============================================================================
CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    bill_code       VARCHAR(32) UNIQUE NOT NULL,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    service         VARCHAR(150) NOT NULL,
    category        VARCHAR(80),
    assessment_no   VARCHAR(50) NOT NULL,
    billing_period  VARCHAR(80),
    due_date        DATE,
    amount          NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    amount_paid     NUMERIC(12,2) DEFAULT 0.00,
    slip_data       TEXT,
    currency        VARCHAR(8) DEFAULT 'LKR',
    status          VARCHAR(30) NOT NULL DEFAULT 'Pending',  
    receipt_no      VARCHAR(50),
    txn_id          VARCHAR(50),
    payment_method  VARCHAR(80),
    paid_at         TIMESTAMPTZ,
    payer_name      VARCHAR(150),
    payer_phone     VARCHAR(30),
    order_id        VARCHAR(64) UNIQUE,
    gateway_ref     VARCHAR(64),
    gateway_status  VARCHAR(32),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user     ON payments (user_id);
CREATE INDEX idx_payments_status   ON payments (status);
CREATE INDEX idx_payments_assess   ON payments (assessment_no);
CREATE INDEX idx_payments_due_date ON payments (due_date);
CREATE INDEX idx_payments_order_id ON payments (order_id);

-- ============================================================================
-- TABLE: notices
-- ============================================================================
CREATE TABLE notices (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    notice_type     VARCHAR(80),
    badge           VARCHAR(50),
    summary         TEXT,
    published_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notices_active ON notices (is_active, published_at DESC);

-- ============================================================================
-- TABLE: news_articles
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
-- TABLE: bins (IoT)
-- ============================================================================
CREATE TABLE bins (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    zone            VARCHAR(120),
    bin_height_cm   DOUBLE PRECISION DEFAULT 40.0,
    status          VARCHAR(50) DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: readings (IoT Telemetry)
-- ============================================================================
CREATE TABLE readings (
    id              BIGSERIAL PRIMARY KEY,
    bin_id          VARCHAR(50) REFERENCES bins(id) ON DELETE CASCADE,
    fill_percentage DOUBLE PRECISION,
    distance_cm     DOUBLE PRECISION,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(50) DEFAULT 'ACTIVE'
);

CREATE INDEX idx_reading_bin_id ON readings (bin_id);
CREATE INDEX idx_reading_timestamp ON readings (timestamp);

-- ============================================================================
-- FUNCTION & TRIGGERS: auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bins_updated BEFORE UPDATE ON bins FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- VIEW: citizen_dashboard_summary
-- ============================================================================
CREATE OR REPLACE VIEW citizen_dashboard_summary AS
SELECT
    u.id AS user_id,
    u.user_code,
    u.name,
    u.zone,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status NOT IN ('RESOLVED', 'REJECTED', 'CLOSED')) AS active_complaints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'RESOLVED') AS resolved_complaints,
    COALESCE(SUM(p.amount - p.amount_paid) FILTER (WHERE p.status NOT IN ('Paid', 'PENDING_VERIFICATION')), 0) AS total_due,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status NOT IN ('Paid', 'PENDING_VERIFICATION')) AS pending_bills
FROM users u
LEFT JOIN complaints c ON c.user_id = u.id
LEFT JOIN payments  p ON p.user_id = u.id
GROUP BY u.id, u.user_code, u.name, u.zone;
