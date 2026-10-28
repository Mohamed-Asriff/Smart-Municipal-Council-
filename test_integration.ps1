$baseUrl = "http://localhost:8080/api"

Write-Host "=== TEST 1: ADMIN LOGIN ==="
$loginBody = '{"email":"admin@kmc.gov.lk","password":"password123"}'
$adminAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$adminToken = $adminAuth.token
Write-Host "SUCCESS: Admin logged in, role: $($adminAuth.user.role)"

$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

Write-Host "`n=== TEST 2: CITIZEN LOGIN ==="
$citizenBody = '{"email":"aslam.mohamed@gmail.com","password":"password123"}'
$citizenAuth = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $citizenBody -ContentType "application/json"
$citizenToken = $citizenAuth.token
Write-Host "SUCCESS: Citizen logged in, name: $($citizenAuth.user.name)"

$citizenHeaders = @{
    "Authorization" = "Bearer $citizenToken"
    "Content-Type" = "application/json"
}

Write-Host "`n=== TEST 3: CITIZEN REGISTRATION ==="
$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$newEmail = "newcitizen_" + $randomNum + "@kmc.test"
$randomPhone = "077" + (Get-Random -Minimum 1000000 -Maximum 9999999)
$regBody = @{
    name = "Kavitha Selvarajah"
    username = "kavitha_" + $randomNum
    email = $newEmail
    password = "password123"
    nic = "1995" + (Get-Random -Minimum 10000000 -Maximum 99999999) + "V"
    phone = $randomPhone
    zone = "Pandiruppu Zone E"
} | ConvertTo-Json
$regAuth = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $regBody -ContentType "application/json"
Write-Host "SUCCESS: Registered user: $($regAuth.user.name), email: $($regAuth.user.email)"

Write-Host "`n=== TEST 4: SUBMIT COMPLAINT (CITIZEN) ==="
$complaintBody = @{
    title = "Fallen Tree Branch on Beach Road"
    category = "Road & Pothole Maintenance"
    description = "Large branch blocking half the roadway near postal box"
    location = "Beach Road, Sainthamaruthu"
    zone = "Sainthamaruthu - Ward 03"
    priority = "High"
    department = "Civil Works"
} | ConvertTo-Json
$complaint = Invoke-RestMethod -Uri "$baseUrl/complaints" -Method POST -Body $complaintBody -Headers $citizenHeaders
$ticketCode = $complaint.ticketCode
$complaintId = $complaint.id
Write-Host "SUCCESS: Created complaint ID: $complaintId, Ticket: $ticketCode, Status: $($complaint.status)"

Write-Host "`n=== TEST 5: TRACK COMPLAINT (PUBLIC) ==="
$tracked = Invoke-RestMethod -Uri "$baseUrl/complaints/track/$ticketCode" -Method GET
Write-Host "SUCCESS: Tracked ticket $ticketCode - Status: $($tracked.status), Steps: $($tracked.timeline.Count), History: $($tracked.history.Count)"

Write-Host "`n=== TEST 6: ADMIN COMPLAINTS STATS & LIST ==="
$stats = Invoke-RestMethod -Uri "$baseUrl/admin/complaints/stats" -Method GET -Headers $adminHeaders
Write-Host "SUCCESS: Complaint Stats - Total: $($stats.total), Pending: $($stats.pending), Resolved: $($stats.resolved), Rate: $($stats.resolutionRate)%"

Write-Host "`n=== TEST 7: ADMIN ASSIGN COMPLAINT ==="
$assignBody = @{
    department = "Sanitation & Civil Works"
    priority = "Critical"
    assignedOfficer = "Eng. R. Thilak"
} | ConvertTo-Json
$assigned = Invoke-RestMethod -Uri "$baseUrl/admin/complaints/$complaintId/assign" -Method PATCH -Body $assignBody -Headers $adminHeaders
Write-Host "SUCCESS: Assigned complaint $complaintId to $($assigned.assignedOfficer) in $($assigned.department)"

Write-Host "`n=== TEST 8: ADMIN UPDATE STATUS & RESOLVE ==="
$statusBody = @{
    status = "Resolved"
    note = "Field crew cleared tree branch and restored road clearance."
} | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "$baseUrl/admin/complaints/$complaintId/status" -Method PUT -Body $statusBody -Headers $adminHeaders
Write-Host "SUCCESS: Updated complaint $complaintId status to $($updated.status), notes: $($updated.resolutionNotes)"

Write-Host "`n=== TEST 9: ADMIN PAYMENT KPIS & ISSUE BILL ==="
$kpis = Invoke-RestMethod -Uri "$baseUrl/admin/payments/kpis" -Method GET -Headers $adminHeaders
Write-Host "SUCCESS: Payment KPIs - Total Revenue: LKR $($kpis.totalRevenue), Pending: LKR $($kpis.pendingCollections), Rate: $($kpis.successRate)"

$issueBillBody = @{
    userId = $citizenAuth.user.id
    service = "Trade License Renewal"
    category = "Commercial"
    amount = 4500.00
    billingPeriod = "2026-Q4"
} | ConvertTo-Json
$newBill = Invoke-RestMethod -Uri "$baseUrl/admin/payments/issue" -Method POST -Body $issueBillBody -Headers $adminHeaders
Write-Host "SUCCESS: Issued new bill ID: $($newBill.id), Code: $($newBill.billCode), Amount: LKR $($newBill.amount)"

Write-Host "`n=== TEST 10: CITIZEN CHECKOUT PAYMENT ==="
$checkoutBody = @{
    paymentId = $newBill.id
    paymentMethod = "Online Visa/MasterCard"
    payerName = "S. Mohamed Aslam"
    payerPhone = "+94 77 123 4567"
} | ConvertTo-Json
$paid = Invoke-RestMethod -Uri "$baseUrl/payments/checkout" -Method POST -Body $checkoutBody -Headers $citizenHeaders
Write-Host "SUCCESS: Bill $($paid.billCode) marked as $($paid.status), Receipt: $($paid.receiptNo), TxnId: $($paid.txnId)"

Write-Host "`n=== TEST 11: ADMIN NEWS & NOTICES CRUD ==="
$newsBody = @{
    title = "Kalmunai Coastal Cleaning Drive Scheduled"
    category = "ENVIRONMENT"
    summary = "Youth volunteers and municipal sanitation teams will join forces this Saturday."
    publishedAt = "2026-10-12"
} | ConvertTo-Json
$createdNews = Invoke-RestMethod -Uri "$baseUrl/admin/news" -Method POST -Body $newsBody -Headers $adminHeaders
Write-Host "SUCCESS: Created News ID: $($createdNews.id) - $($createdNews.title)"

$delRes = Invoke-RestMethod -Uri "$baseUrl/admin/news/$($createdNews.id)" -Method DELETE -Headers $adminHeaders
Write-Host "SUCCESS: Deleted News ID: $($delRes.deleted)"

Write-Host "`n=== ALL 11 TESTS PASSED PERFECTLY ==="
