export const mockTickets = {
  "KMC-2026-8492": {
    id: "KMC-2026-8492",
    category: "Street Lighting & Electrical",
    title: "Broken Streetlight near Sainthamaruthu Bus Stand",
    location: "Main Street, Sainthamaruthu 03",
    dateSubmitted: "2026-09-12 18:30",
    priority: "HIGH (AI Calculated)",
    department: "Electrical & Public Utilities",
    status: "In Progress",
    assignedOfficer: "Eng. M. S. Farook",
    timeline: [
      { step: "Submitted by Citizen", time: "Sep 12, 18:30", done: true },
      { step: "AI Category & Priority Validation", time: "Sep 12, 18:31", done: true },
      { step: "Dispatched to Electrical Department", time: "Sep 12, 19:05", done: true },
      { step: "Field Technician Repair in Progress", time: "Sep 14, 09:15", done: true },
      { step: "Final Quality Check & Resolution", time: "Pending", done: false }
    ]
  },
  "KMC-2026-7310": {
    id: "KMC-2026-7310",
    category: "Drainage & Sewerage",
    title: "Drain Blockage on Hospital Road Kalmunai",
    location: "Hospital Road, Kalmunai Town",
    dateSubmitted: "2026-09-10 10:15",
    priority: "CRITICAL",
    department: "Sanitation & Engineering",
    status: "Resolved",
    assignedOfficer: "Inspector A. R. Mohamed",
    timeline: [
      { step: "Submitted by Citizen", time: "Sep 10, 10:15", done: true },
      { step: "AI Priority: Flood Risk Alert", time: "Sep 10, 10:16", done: true },
      { step: "Emergency Crew Deployed", time: "Sep 10, 11:00", done: true },
      { step: "Drain Cleared & Waste Removed", time: "Sep 10, 14:30", done: true },
      { step: "Resolved & Citizen Notified", time: "Sep 10, 15:00", done: true }
    ]
  },
  "KMC-2026-9021": {
    id: "KMC-2026-9021",
    category: "Smart Waste System",
    title: "Automated IoT Alert: Market Dustbin 88% Full",
    location: "Kalmunai Central Market",
    dateSubmitted: "2026-09-14 11:45",
    priority: "HIGH",
    department: "Waste Management Division",
    status: "Dispatched",
    assignedOfficer: "Automated Truck Dispatch #4",
    timeline: [
      { step: "IoT Sensor Threshold Exceeded (88%)", time: "Sep 14, 11:45", done: true },
      { step: "Automated System Ticket Generation", time: "Sep 14, 11:45", done: true },
      { step: "Sanitation Vehicle #04 Assigned", time: "Sep 14, 11:48", done: true },
      { step: "Collection En Route", time: "In Progress", done: false }
    ]
  }
};

export const newsArticles = [
  {
    id: 1,
    date: "14 SEP 2026",
    category: "SMART CITY INITIATIVE",
    title: "Kalmunai Municipal Council Launches Phase II IoT Smart Bins Across All Wards",
    summary: "In partnership with Moratuwa University IT Division, 50 additional IoT-enabled smart waste bins with real-time level sensors are deployed in Maruthamunai & Sainthamaruthu.",
    author: "Municipal Commissioner's Office"
  },
  {
    id: 2,
    date: "11 SEP 2026",
    category: "DISASTER PREPAREDNESS",
    title: "Monsoon Drainage Maintenance Campaign Initiated in Kalmunai Central",
    summary: "Pre-monsoon clearing of primary municipal canals and stormwater drains is underway. Citizens can report clogged drains instantly using the new online portal.",
    author: "Department of Public Works"
  },
  {
    id: 3,
    date: "05 SEP 2026",
    category: "E-GOVERNANCE",
    title: "Digital Property Tax Payment Portal Introduced for Commercial Buildings",
    summary: "Business owners can now pay municipal shop leases and assessment taxes online via secure payment gateways with instant digital e-receipts.",
    author: "Treasury & Revenue Division"
  }
];
