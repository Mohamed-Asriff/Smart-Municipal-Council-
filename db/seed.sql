-- ============================================================================
-- Seed data — matches frontend mock data exactly
-- ============================================================================

-- Demo user (password below is "password123" hashed with BCrypt cost 10)
INSERT INTO users (user_code, name, email, phone, nic, password_hash, role, zone, address, assessment_no, status)
VALUES
('USR-KMC-9042', 'A. Mohamed Rizwan', 'rizwan.kmc@gmail.com', '+94 77 234 5678', '199214502891V',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'CITIZEN', 'Sainthamaruthu - Ward 03',
 'No. 45/A, Beach Road, Sainthamaruthu, Kalmunai',
 'KMC-TAX-2026-9041', 'Verified Citizen');

-- Officer demo account
INSERT INTO users (user_code, name, email, phone, nic, password_hash, role, zone, status)
VALUES
('USR-KMC-1001', 'Eng. M. S. Farook', 'farook@kalmunaimc.gov.lk', '+94 67 222 0261', '197812304512V',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
 'OFFICER', 'Electrical Division', 'Municipal Officer');

-- ---------------------------------------------------------------------------
-- Complaints
-- ---------------------------------------------------------------------------
INSERT INTO complaints (ticket_code, user_id, title, category, zone, location, priority, status, department, assigned_officer, description)
VALUES
('KMC-2026-8492', 1, 'Broken Streetlight near Sainthamaruthu Bus Stand',
 'Street Lighting & Electrical', 'Sainthamaruthu - Ward 03', 'Main Street, near Bus Stand',
 'High', 'In Progress', 'Electrical Division', 'Eng. M. S. Farook',
 'Street lamp pole #14 has been flickering and completely off for 3 nights, causing safety concerns for evening commuters.'),

('KMC-2026-7310', 1, 'Drain Blockage on Hospital Road',
 'Drainage & Sewerage', 'Kalmunai Town Zone A', 'Hospital Road, Kalmunai Town',
 'Critical', 'Resolved', 'Sanitation & Engineering', 'Inspector A. R. Mohamed',
 'Heavy rain water overflowing due to plastic and debris blockage in the main drain channel near the dispensary.'),

('KMC-2026-9214', 1, 'Overfilled Smart Waste Bin at Central Fish Market',
 'Waste Management', 'Kalmunai Coastal Belt', 'Central Market Gate 2',
 'Medium', 'Dispatched', 'Waste Management Division', 'Sanitation Truck #04',
 'IoT sensor triggered alert at 85% bin fill capacity during morning market hours.');

-- ---------------------------------------------------------------------------
-- Complaint timelines
-- ---------------------------------------------------------------------------
INSERT INTO complaint_timeline (complaint_id, step, step_time, done, sequence_no) VALUES
-- KMC-2026-8492
(1, 'Complaint Filed',              'Sep 12, 18:30', TRUE,  1),
(1, 'AI Priority Triage',           'Sep 12, 18:31', TRUE,  2),
(1, 'Dispatched to Field Crew',     'Sep 13, 09:00', TRUE,  3),
(1, 'Work Order in Progress',       'Sep 14, 11:20', TRUE,  4),
(1, 'Inspection & Resolution',      'Pending',       FALSE, 5),
-- KMC-2026-7310
(2, 'Complaint Filed',              'Sep 10, 10:15', TRUE,  1),
(2, 'AI Flood Risk Detected',       'Sep 10, 10:16', TRUE,  2),
(2, 'Emergency Crew Deployed',      'Sep 10, 11:00', TRUE,  3),
(2, 'Debris Cleared & Sanitized',   'Sep 10, 14:30', TRUE,  4),
(2, 'Case Closed by Inspector',     'Sep 10, 15:00', TRUE,  5),
-- KMC-2026-9214
(3, 'IoT Automated Trigger',        'Sep 14, 08:45', TRUE,  1),
(3, 'Assigned to Compactor 04',     'Sep 14, 08:50', TRUE,  2),
(3, 'Truck En Route',               'Sep 14, 09:15', TRUE,  3);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
INSERT INTO payments (bill_code, user_id, service, category, assessment_no, billing_period, due_date, amount, status, receipt_no, paid_at, payment_method)
VALUES
('BILL-2026-Q3-01', 1, 'Property Assessment Tax', 'Taxes', 'KMC-TAX-2026-9041',
 'Q3 (Jul - Sep 2026)', '2026-09-30', 4700.00, 'Pending', NULL, NULL, NULL),

('BILL-2026-TL-09', 1, 'Annual Trade & Commercial License', 'Licenses', 'KMC-LIC-7890',
 'Year 2026', '2026-10-15', 8500.00, 'Pending', NULL, NULL, NULL),

('BILL-2026-Q2-01', 1, 'Property Assessment Tax', 'Taxes', 'KMC-TAX-2026-9041',
 'Q2 (Apr - Jun 2026)', '2026-06-30', 4700.00, 'Paid', 'REC-KMC-994201',
 '2026-06-25 14:22:00+05:30', 'Digital Card / LankaPay'),

('BILL-2026-WM-05', 1, 'Commercial Waste Collection Fee', 'Utilities', 'KMC-WM-1142',
 'May 2026', '2026-05-31', 1200.00, 'Paid', 'REC-KMC-881240',
 '2026-05-28 09:15:00+05:30', 'Online Banking');

-- ---------------------------------------------------------------------------
-- Public notices
-- ---------------------------------------------------------------------------
INSERT INTO notices (title, notice_type, badge, summary, published_at) VALUES
('10% Early Bird Rebate on Q4 2026 Assessment Tax', 'Financial', 'Discount',
 'Citizens paying their upcoming Q4 assessment taxes before October 10 receive a 10% instant rebate.', '2026-09-14'),
('Sainthamaruthu Drainage Desilting Schedule', 'Public Works', 'Maintenance',
 'Pre-monsoon canal desilting will occur along Beach Road on Saturday, 19th Sep between 08:00 AM - 02:00 PM.', '2026-09-12'),
('Digital E-Building Permit Fast-Track', 'Service', 'New Feature',
 'Residential construction permits under 2,000 sq ft are now processed within 5 working days online.', '2026-09-08');

-- ---------------------------------------------------------------------------
-- News articles
-- ---------------------------------------------------------------------------
INSERT INTO news_articles (title, category, summary, author, published_at) VALUES
('Kalmunai Municipal Council Launches Phase II IoT Smart Bins Across All Wards',
 'SMART CITY INITIATIVE',
 'In partnership with Moratuwa University IT Division, 50 additional IoT-enabled smart waste bins with real-time level sensors are deployed in Maruthamunai & Sainthamaruthu.',
 'Municipal Commissioner''s Office', '2026-09-14'),
('Monsoon Drainage Maintenance Campaign Initiated in Kalmunai Central',
 'DISASTER PREPAREDNESS',
 'Pre-monsoon clearing of primary municipal canals and stormwater drains is underway. Citizens can report clogged drains instantly using the new online portal.',
 'Department of Public Works', '2026-09-11'),
('Digital Property Tax Payment Portal Introduced for Commercial Buildings',
 'E-GOVERNANCE',
 'Business owners can now pay municipal shop leases and assessment taxes online via secure payment gateways with instant digital e-receipts.',
 'Treasury & Revenue Division', '2026-09-05');

-- ============================================================================
-- END OF SEED
-- ============================================================================