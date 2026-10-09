export const defaultCitizenProfile = {
  id: "USR-KMC-9042",
  name: "A. Mohamed Rizwan",
  email: "rizwan.kmc@gmail.com",
  phone: "+94 77 234 5678",
  nic: "199214502891V",
  zone: "Sainthamaruthu - Ward 03",
  address: "No. 45/A, Beach Road, Sainthamaruthu, Kalmunai",
  assessmentNo: "KMC-TAX-2026-9041",
  joinedDate: "January 2025",
  status: "Verified Citizen",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
};

export const initialComplaints = [
  {
    id: "KMC-2026-8492",
    title: "Broken Streetlight near Sainthamaruthu Bus Stand",
    category: "Street Lighting & Electrical",
    zone: "Sainthamaruthu - Ward 03",
    location: "Main Street, near Bus Stand",
    date: "2026-09-12 18:30",
    priority: "High",
    status: "In Progress",
    officer: "Eng. M. S. Farook",
    department: "Electrical Division",
    description: "Street lamp pole #14 has been flickering and completely off for 3 nights, causing safety concerns for evening commuters.",
    timeline: [
      { step: "Complaint Filed", date: "Sep 12, 18:30", done: true },
      { step: "AI Priority Triage", date: "Sep 12, 18:31", done: true },
      { step: "Dispatched to Field Crew", date: "Sep 13, 09:00", done: true },
      { step: "Work Order in Progress", date: "Sep 14, 11:20", done: true },
      { step: "Inspection & Resolution", date: "Pending", done: false }
    ]
  },
  {
    id: "KMC-2026-7310",
    title: "Drain Blockage on Hospital Road",
    category: "Drainage & Sewerage",
    zone: "Kalmunai Town Zone A",
    location: "Hospital Road, Kalmunai Town",
    date: "2026-09-10 10:15",
    priority: "Critical",
    status: "Resolved",
    officer: "Inspector A. R. Mohamed",
    department: "Sanitation & Engineering",
    description: "Heavy rain water overflowing due to plastic and debris blockage in the main drain channel near the dispensary.",
    timeline: [
      { step: "Complaint Filed", date: "Sep 10, 10:15", done: true },
      { step: "AI Flood Risk Detected", date: "Sep 10, 10:16", done: true },
      { step: "Emergency Crew Deployed", date: "Sep 10, 11:00", done: true },
      { step: "Debris Cleared & Sanitized", date: "Sep 10, 14:30", done: true },
      { step: "Case Closed by Inspector", date: "Sep 10, 15:00", done: true }
    ]
  },
  {
    id: "KMC-2026-9214",
    title: "Overfilled Smart Waste Bin at Central Fish Market",
    category: "Waste Management",
    zone: "Kalmunai Coastal Belt",
    location: "Central Market Gate 2",
    date: "2026-09-14 08:45",
    priority: "Medium",
    status: "Dispatched",
    officer: "Sanitation Truck #04",
    department: "Waste Management Division",
    description: "IoT sensor triggered alert at 85% bin fill capacity during morning market hours.",
    timeline: [
      { step: "IoT Automated Trigger", date: "Sep 14, 08:45", done: true },
      { step: "Assigned to Compactor 04", date: "Sep 14, 08:50", done: true },
      { step: "Truck En Route", date: "Sep 14, 09:15", done: true }
    ]
  }
];

export const initialPayments = [
  {
    id: "BILL-2026-Q3-01",
    service: "Property Assessment Tax",
    category: "Taxes",
    assessmentNo: "KMC-TAX-2026-9041",
    billingPeriod: "Q3 (Jul - Sep 2026)",
    dueDate: "2026-09-30",
    amount: 4700,
    status: "Pending",
    receiptNo: null,
    paidAt: null
  },
  {
    id: "BILL-2026-TL-09",
    service: "Annual Trade & Commercial License",
    category: "Licenses",
    assessmentNo: "KMC-LIC-7890",
    billingPeriod: "Year 2026",
    dueDate: "2026-10-15",
    amount: 8500,
    status: "Pending",
    receiptNo: null,
    paidAt: null
  },
  {
    id: "BILL-2026-Q2-01",
    service: "Property Assessment Tax",
    category: "Taxes",
    assessmentNo: "KMC-TAX-2026-9041",
    billingPeriod: "Q2 (Apr - Jun 2026)",
    dueDate: "2026-06-30",
    amount: 4700,
    status: "Paid",
    receiptNo: "REC-KMC-994201",
    paidAt: "2026-06-25 14:22",
    method: "Digital Card / LankaPay"
  },
  {
    id: "BILL-2026-WM-05",
    service: "Commercial Waste Collection Fee",
    category: "Utilities",
    assessmentNo: "KMC-WM-1142",
    billingPeriod: "May 2026",
    dueDate: "2026-05-31",
    amount: 1200,
    status: "Paid",
    receiptNo: "REC-KMC-881240",
    paidAt: "2026-05-28 09:15",
    method: "Online Banking"
  }
];

export const initialNotices = [
  {
    id: 1,
    title: "10% Early Bird Rebate on Q4 2026 Assessment Tax",
    date: "14 Sep 2026",
    type: "Financial",
    badge: "Discount",
    summary: "Citizens paying their upcoming Q4 assessment taxes before October 10 receive a 10% instant rebate."
  },
  {
    id: 2,
    title: "Sainthamaruthu Drainage Desilting Schedule",
    date: "12 Sep 2026",
    type: "Public Works",
    badge: "Maintenance",
    summary: "Pre-monsoon canal desilting will occur along Beach Road on Saturday, 19th Sep between 08:00 AM - 02:00 PM."
  },
  {
    id: 3,
    title: "Digital E-Building Permit Fast-Track",
    date: "08 Sep 2026",
    type: "Service",
    badge: "New Feature",
    summary: "Residential construction permits under 2,000 sq ft are now processed within 5 working days online."
  }
];
