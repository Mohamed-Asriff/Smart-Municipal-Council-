package com.smc.controller;

import com.smc.dto.*;
import com.smc.entity.Complaint;
import com.smc.entity.NewsArticle;
import com.smc.entity.Notice;
import com.smc.entity.Payment;
import com.smc.entity.User;
import com.smc.repository.NewsRepository;
import com.smc.repository.NoticeRepository;
import com.smc.repository.UserRepository;
import com.smc.service.ComplaintService;
import com.smc.service.PaymentService;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final NewsRepository newsRepository;
    private final NoticeRepository noticeRepository;
    private final ComplaintService complaintService;
    private final PaymentService paymentService;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository,
                           NewsRepository newsRepository,
                           NoticeRepository noticeRepository,
                           ComplaintService complaintService,
                           PaymentService paymentService,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.newsRepository = newsRepository;
        this.noticeRepository = noticeRepository;
        this.complaintService = complaintService;
        this.paymentService = paymentService;
        this.passwordEncoder = passwordEncoder;
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    // ================= NEWS MANAGEMENT (FULL CRUD) =================

    @GetMapping("/news")
    public ResponseEntity<?> allAdminNews() {
        return ResponseEntity.ok(newsRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt", "id")));
    }

    @PostMapping("/news")
    public ResponseEntity<?> createNews(@RequestBody Map<String, Object> body) {
        User me = currentUser();
        NewsArticle article = new NewsArticle();

        String title = body.getOrDefault("title", "").toString().trim();
        article.setTitle(title.isEmpty() ? "Untitled News" : title);

        String category = body.getOrDefault("category", "").toString().trim();
        article.setCategory(category.isEmpty() ? "General" : category);

        String summary = body.getOrDefault("summary", "").toString().trim();
        article.setSummary(summary);

        String author = body.getOrDefault("author", "").toString().trim();
        if (author.isEmpty()) {
            author = me != null && me.getName() != null && !me.getName().isBlank() ? me.getName() : "Kalmunai Municipal Council";
        }
        article.setAuthor(author);

        String dateStr = body.getOrDefault("publishedAt", "").toString().trim();
        LocalDate pubDate = LocalDate.now();
        if (!dateStr.isEmpty()) {
            try {
                pubDate = LocalDate.parse(dateStr);
            } catch (DateTimeParseException ignored) {
                pubDate = LocalDate.now();
            }
        }
        article.setPublishedAt(pubDate);

        boolean active = true;
        if (body.containsKey("isActive") && body.get("isActive") != null) {
            active = Boolean.parseBoolean(body.get("isActive").toString());
        }
        article.setIsActive(active);

        return ResponseEntity.ok(newsRepository.save(article));
    }

    @PutMapping("/news/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateNews(@PathVariable long id, @RequestBody Map<String, Object> body) {
        return newsRepository.findById(id).map(article -> {
            if (body.containsKey("title") && body.get("title") != null) {
                String t = body.get("title").toString().trim();
                if (!t.isEmpty()) article.setTitle(t);
            }
            if (body.containsKey("category") && body.get("category") != null) {
                String c = body.get("category").toString().trim();
                if (!c.isEmpty()) article.setCategory(c);
            }
            if (body.containsKey("summary") && body.get("summary") != null) {
                article.setSummary(body.get("summary").toString().trim());
            }
            if (body.containsKey("author") && body.get("author") != null) {
                String a = body.get("author").toString().trim();
                if (!a.isEmpty()) article.setAuthor(a);
            }
            if (body.containsKey("publishedAt") && body.get("publishedAt") != null) {
                String pStr = body.get("publishedAt").toString().trim();
                if (!pStr.isEmpty()) {
                    try {
                        article.setPublishedAt(LocalDate.parse(pStr));
                    } catch (Exception ignored) {}
                }
            }
            if (body.containsKey("isActive") && body.get("isActive") != null) {
                article.setIsActive(Boolean.parseBoolean(body.get("isActive").toString()));
            }
            return ResponseEntity.ok(newsRepository.save(article));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable long id) {
        if (newsRepository.existsById(id)) {
            newsRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("deleted", id));
        }
        return ResponseEntity.notFound().build();
    }

    // ================= NOTICES MANAGEMENT =================

    @GetMapping("/notices")
    public ResponseEntity<?> allAdminNotices() {
        return ResponseEntity.ok(noticeRepository.findAll(Sort.by(Sort.Direction.DESC, "publishedAt", "id")));
    }

    @PostMapping("/notices")
    public ResponseEntity<?> createNotice(@RequestBody Map<String, String> body) {
        Notice n = new Notice();
        n.setTitle(body.getOrDefault("title", "Untitled Notice"));
        n.setNoticeType(body.getOrDefault("noticeType", "General"));
        n.setBadge(body.getOrDefault("badge", "Official"));
        n.setSummary(body.getOrDefault("summary", ""));
        n.setPublishedAt(LocalDate.parse(body.getOrDefault("publishedAt", LocalDate.now().toString())));
        n.setIsActive(true);
        return ResponseEntity.ok(noticeRepository.save(n));
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable long id) {
        noticeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    // ================= COMPLAINTS MANAGEMENT =================

    @GetMapping("/complaints")
    public ResponseEntity<?> getComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "false") boolean paginated
    ) {
        if (paginated) {
            String filterCat = (department != null && !department.isBlank()) ? department : category;
            return ResponseEntity.ok(complaintService.searchComplaints(status, filterCat, q, page, size));
        }
        return ResponseEntity.ok(complaintService.getAllComplaints().stream().map(ComplaintResponse::from).toList());
    }

    @GetMapping("/complaints/search")
    public ResponseEntity<PageResponse<ComplaintResponse>> searchComplaints(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(complaintService.searchComplaints(status, category, q, page, size));
    }

    @GetMapping("/complaints/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(complaintService.getStats());
    }

    @GetMapping("/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaint(@PathVariable Long id) {
        return ResponseEntity.ok(ComplaintResponse.from(complaintService.getById(id)));
    }

    @RequestMapping(value = "/complaints/{id}/status", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request
    ) {
        User me = currentUser();
        String adminName = me != null ? me.getName() : "Administrator";
        Complaint updated = complaintService.updateStatus(id, request, adminName);
        return ResponseEntity.ok(ComplaintResponse.from(updated));
    }

    @PatchMapping("/complaints/{id}/assign")
    public ResponseEntity<?> assignComplaint(
            @PathVariable Long id,
            @RequestBody AssignRequest request
    ) {
        User me = currentUser();
        String adminName = me != null ? me.getName() : "Administrator";
        Complaint updated = complaintService.assign(id, request, adminName);
        return ResponseEntity.ok(ComplaintResponse.from(updated));
    }

    // ================= USERS MANAGEMENT =================

    @GetMapping("/users")
    public ResponseEntity<?> allUsers() {
        List<User> users = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) {
        String name = body.getOrDefault("name", "").toString().trim();
        String email = body.getOrDefault("email", "").toString().trim().toLowerCase();
        if (name.isEmpty() || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name and email are required."));
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "A citizen with this email is already registered."));
        }

        String username = body.getOrDefault("username", "").toString().trim();
        if (username.isEmpty()) {
            username = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "") + "_" + (int)(Math.random() * 900 + 100);
        }

        String phone = body.getOrDefault("phone", "").toString().trim();
        String nic = body.getOrDefault("nic", "").toString().trim();
        String assessmentNo = body.getOrDefault("assessmentNo", "").toString().trim();
        if (assessmentNo.isEmpty()) {
            assessmentNo = "KMC-TAX-2026-" + (int)(Math.random() * 9000 + 1000);
        }
        String role = body.getOrDefault("role", "CITIZEN").toString().trim().toUpperCase();
        String status = body.getOrDefault("status", "Verified Citizen").toString().trim();
        String zone = body.getOrDefault("zone", "Kalmunai Town").toString().trim();
        String address = body.getOrDefault("address", "Main Street").toString().trim();
        String rawPassword = body.getOrDefault("password", "password123").toString();

        User user = new User();
        user.setUserCode("USR-KMC-" + (int)(Math.random() * 9000 + 1000));
        user.setName(name);
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(phone.isEmpty() ? null : phone);
        user.setPhoneNormalized(phone.isEmpty() ? null : phone.replaceAll("[^0-9+]", ""));
        user.setNic(nic.isEmpty() ? null : nic);
        user.setAssessmentNo(assessmentNo);
        user.setRole(role);
        user.setStatus(status);
        user.setZone(zone);
        user.setAddress(address);
        user.setIsActive(true);
        user.setPasswordHash(passwordEncoder.encode(rawPassword.isBlank() ? "password123" : rawPassword));

        User saved = userRepository.save(user);
        saved.setPasswordHash(null);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/users/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<?> updateUser(@PathVariable long id, @RequestBody Map<String, Object> body) {
        return userRepository.findById(id).map(user -> {
            if (body.containsKey("name") && body.get("name") != null) {
                String name = body.get("name").toString().trim();
                if (!name.isEmpty()) user.setName(name);
            }
            if (body.containsKey("email") && body.get("email") != null) {
                String email = body.get("email").toString().trim().toLowerCase();
                if (!email.isEmpty() && !email.equalsIgnoreCase(user.getEmail())) {
                    if (userRepository.existsByEmailIgnoreCase(email)) {
                        return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered by another citizen."));
                    }
                    user.setEmail(email);
                }
            }
            if (body.containsKey("phone") && body.get("phone") != null) {
                String phone = body.get("phone").toString().trim();
                user.setPhone(phone);
                user.setPhoneNormalized(phone.replaceAll("[^0-9+]", ""));
            }
            if (body.containsKey("nic") && body.get("nic") != null) {
                user.setNic(body.get("nic").toString().trim());
            }
            if (body.containsKey("assessmentNo") && body.get("assessmentNo") != null) {
                user.setAssessmentNo(body.get("assessmentNo").toString().trim());
            }
            if (body.containsKey("role") && body.get("role") != null) {
                user.setRole(body.get("role").toString().trim().toUpperCase());
            }
            if (body.containsKey("status") && body.get("status") != null) {
                user.setStatus(body.get("status").toString().trim());
            }
            if (body.containsKey("zone") && body.get("zone") != null) {
                user.setZone(body.get("zone").toString().trim());
            }
            if (body.containsKey("address") && body.get("address") != null) {
                user.setAddress(body.get("address").toString().trim());
            }
            if (body.containsKey("password") && body.get("password") != null) {
                String p = body.get("password").toString().trim();
                if (!p.isEmpty() && p.length() >= 6) {
                    user.setPasswordHash(passwordEncoder.encode(p));
                }
            }
            User saved = userRepository.save(user);
            saved.setPasswordHash(null);
            return ResponseEntity.ok((Object) saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    // ================= PAYMENTS & REVENUE MANAGEMENT =================

    @GetMapping("/payments")
    public ResponseEntity<?> allPayments() {
        return ResponseEntity.ok(paymentService.getAllTransactions());
    }

    @GetMapping("/payments/kpis")
    public ResponseEntity<?> paymentKPIs() {
        return ResponseEntity.ok(paymentService.getAdminKPIs());
    }

    @PostMapping("/payments/issue")
    public ResponseEntity<?> issueBill(@RequestBody IssueBillRequest req) {
        return ResponseEntity.ok(paymentService.issueNewBill(req));
    }

    @PutMapping("/payments/{id}/status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        String status = body.get("status");
        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
        }

        try {
            Payment updatedPayment = paymentService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(updatedPayment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}