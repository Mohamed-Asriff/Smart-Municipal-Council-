-- ============================================================================
-- Kalmunai Municipal Council - Seed Data (v3.0)
-- Run AFTER schema.sql
-- Password for all demo accounts: password123 
-- ============================================================================

-- 1. USERS
INSERT INTO users (user_code, name, username, email, phone, phone_normalized, nic, password_hash, role, zone, address, assessment_no, status)
VALUES
('USR-KMC-ADMIN', 'Municipal Commissioner', 'admin', 'admin@kalmunaimc.gov.lk', '+94 67 222 0261', '+94672220261', '197000000001V',
 '$2a$10$PmA3scCElZug1Q0GXyawnuru8mvyT.79yC3rhafeQDtVOQ.ja5TTW',
 'ADMIN', 'HQ', 'KMC Secretariat', 'KMC-ADMIN-0001', 'Active'),

('USR-KMC-9042', 'A. Mohamed Rizwan', 'rizwan', 'rizwan.kmc@gmail.com', '+94 77 234 5678', '+94772345678', '199214502891V',
 '$2a$10$PmA3scCElZug1Q0GXyawnuru8mvyT.79yC3rhafeQDtVOQ.ja5TTW',
 'CITIZEN', 'Sainthamaruthu - Ward 03', 'Beach Road', 'KMC-TAX-2026-9041', 'Verified Citizen'),

('USR-KMC-1002', 'S. Fathima', 'fathima', 'fathima@gmail.com', '+94 77 987 6543', '+94779876543', '199514503922V',
 '$2a$10$PmA3scCElZug1Q0GXyawnuru8mvyT.79yC3rhafeQDtVOQ.ja5TTW',
 'CITIZEN', 'Kalmunai Town', 'Main Street', 'KMC-TAX-2026-9042', 'Verified Citizen');

-- 2. COMPLAINTS
INSERT INTO complaints (ticket_code, user_id, title, description, category, zone, location, priority, status, department, assigned_officer, latitude, longitude)
VALUES
('KMC-2026-8492', (SELECT id FROM users WHERE email = 'rizwan.kmc@gmail.com'), 'Broken Streetlight near Bus Stand', 'Street lamp pole #14 is completely off, causing safety concerns.', 'Electrical', 'Sainthamaruthu', 'Main Street', 'HIGH', 'IN_PROGRESS', 'Electrical Division', 'Eng. M. S. Farook', 7.4167, 81.8167),

('KMC-2026-7310', (SELECT id FROM users WHERE email = 'fathima@gmail.com'), 'Drain Blockage on Hospital Road', 'Heavy rain water overflowing due to plastic blockage.', 'Drainage', 'Kalmunai Town', 'Hospital Road', 'CRITICAL', 'RESOLVED', 'Sanitation', 'Inspector A. R.', 7.4100, 81.8200),

('KMC-2026-9214', (SELECT id FROM users WHERE email = 'rizwan.kmc@gmail.com'), 'Garbage Pile at Central Market', 'Waste hasn''t been collected in 3 days.', 'Waste', 'Kalmunai Coastal', 'Market Gate 2', 'MEDIUM', 'SUBMITTED', 'Waste Management', NULL, 7.4050, 81.8150);

-- 3. COMPLAINT TIMELINE
INSERT INTO complaint_timeline (complaint_id, step, step_time, done, sequence_no) VALUES
((SELECT id FROM complaints WHERE ticket_code = 'KMC-2026-8492'), 'Complaint Filed', 'Sep 12, 18:30', TRUE, 1),
((SELECT id FROM complaints WHERE ticket_code = 'KMC-2026-8492'), 'AI Triage', 'Sep 12, 18:31', TRUE, 2),
((SELECT id FROM complaints WHERE ticket_code = 'KMC-2026-8492'), 'Dispatched', 'Sep 13, 09:00', TRUE, 3),
((SELECT id FROM complaints WHERE ticket_code = 'KMC-2026-8492'), 'Resolution', 'Pending', FALSE, 4);

-- 4. COMPLAINT STATUS HISTORY
INSERT INTO complaint_status_history (complaint_id, status, note, changed_by) VALUES
((SELECT id FROM complaints WHERE ticket_code = 'KMC-2026-8492'), 'SUBMITTED', 'Complaint filed by citizen', 'citizen'),
((SELECT id FROM complaints WHERE ticket_code = 'KMC-2026-8492'), 'IN_PROGRESS', 'Assigned to Electrical Division', 'admin');

-- 5. PAYMENTS (Including Partial Payments)
INSERT INTO payments (bill_code, user_id, service, category, assessment_no, billing_period, due_date, amount, amount_paid, status, receipt_no, paid_at, payment_method)
VALUES
('BILL-2026-A1', (SELECT id FROM users WHERE email = 'rizwan.kmc@gmail.com'), 'Property Assessment Tax', 'Taxes', 'KMC-TAX-2026-9041', 'Q3 2026', CURRENT_DATE + 10, 5000.00, 0.00, 'Pending', NULL, NULL, NULL),
('BILL-2026-A2', (SELECT id FROM users WHERE email = 'rizwan.kmc@gmail.com'), 'Waste Management Fee', 'Utilities', 'KMC-TAX-2026-9041', 'Oct 2026', CURRENT_DATE + 5, 500.00, 200.00, 'Partially Paid', NULL, NULL, 'Bank Transfer'),
('BILL-2026-A3', (SELECT id FROM users WHERE email = 'fathima@gmail.com'), 'Trade License Fee', 'Licenses', 'KMC-TAX-2026-9042', 'Year 2026', CURRENT_DATE - 5, 3500.00, 3500.00, 'Paid', 'REC-KMC-994201', NOW() - INTERVAL '2 day', 'Visa/Mastercard');

-- 6. NOTICES
INSERT INTO notices (title, notice_type, badge, summary, published_at) VALUES
('Q4 Tax Rebate', 'Financial', 'Discount', 'Pay your assessment tax before Nov 15 to get a 5% discount.', CURRENT_DATE),
('Dengue Prevention', 'Health', 'Urgent', 'Clear all stagnant water. Fogging will begin on Monday.', CURRENT_DATE);

-- 7. NEWS ARTICLES
INSERT INTO news_articles (title, category, summary, author, published_at) VALUES
('Smart Waste Bins Deployed', 'Smart City', '10 new IoT bins are now active in the Kalmunai coastal belt.', 'Municipal Council', CURRENT_DATE),
('Water Supply Maintenance', 'Public Works', 'Scheduled maintenance on the main pipeline this weekend.', 'Water Board', CURRENT_DATE);

-- 8. BINS (IoT)
INSERT INTO bins (id, name, latitude, longitude, zone, bin_height_cm, status) VALUES
('BIN-001', 'Bus Stand Bin', 7.4130, 81.8200, 'Town Center', 40.0, 'ACTIVE'),
('BIN-002', 'Main Market Bin', 7.4155, 81.8215, 'Town Center', 40.0, 'ACTIVE'),
('BIN-003', 'Beach Road Bin', 7.4170, 81.8310, 'Beach Side', 40.0, 'ACTIVE');

-- 9. READINGS (IoT Telemetry)
INSERT INTO readings (bin_id, fill_percentage, distance_cm, timestamp, status) VALUES
('BIN-001', 25.5, 29.8, NOW() - INTERVAL '1 hour', 'ACTIVE'),
('BIN-002', 92.0, 3.2, NOW() - INTERVAL '30 minute', 'ACTIVE'),
('BIN-003', 65.0, 14.0, NOW() - INTERVAL '10 minute', 'ACTIVE');