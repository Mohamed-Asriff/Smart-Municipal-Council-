package com.smc.controller;

import com.smc.entity.Complaint;
import com.smc.entity.NewsArticle;
import com.smc.entity.Notice;
import com.smc.entity.User;
import com.smc.repository.ComplaintRepository;
import com.smc.repository.NewsRepository;
import com.smc.repository.NoticeRepository;
import com.smc.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final NewsRepository newsRepository;
    private final NoticeRepository noticeRepository;
    private final ComplaintRepository complaintRepository;

    public AdminController(UserRepository userRepository,
                           NewsRepository newsRepository,
                           NoticeRepository noticeRepository,
                           ComplaintRepository complaintRepository) {
        this.userRepository = userRepository;
        this.newsRepository = newsRepository;
        this.noticeRepository = noticeRepository;
        this.complaintRepository = complaintRepository;
    }

    /** Look up the currently logged-in user from the JWT. */
    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow();
    }

    // ============================================================
    // NEWS
    // ============================================================

    @PostMapping("/news")
    public ResponseEntity<?> createNews(@RequestBody Map<String, String> body) {
        User me = currentUser();
        if (!me.isAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        }
        NewsArticle article = new NewsArticle();
        article.setTitle(body.getOrDefault("title", "Untitled"));
        article.setCategory(body.getOrDefault("category", "General"));
        article.setSummary(body.getOrDefault("summary", ""));
        article.setAuthor(body.getOrDefault("author", me.getName()));
        article.setPublishedAt(LocalDate.parse(body.getOrDefault("publishedAt", LocalDate.now().toString())));
        article.setIsActive(true);
        return ResponseEntity.ok(newsRepository.save(article));
    }

    @DeleteMapping("/news/{id}")
    public ResponseEntity<?> deleteNews(@PathVariable long id) {
        User me = currentUser();
        if (!me.isAdmin()) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        newsRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    // ============================================================
    // NOTICES
    // ============================================================

    @PostMapping("/notices")
    public ResponseEntity<?> createNotice(@RequestBody Map<String, String> body) {
        User me = currentUser();
        if (!me.isAdmin()) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        Notice n = new Notice();
        n.setTitle(body.getOrDefault("title", "Untitled"));
        n.setNoticeType(body.getOrDefault("noticeType", "General"));
        n.setBadge(body.getOrDefault("badge", ""));
        n.setSummary(body.getOrDefault("summary", ""));
        n.setPublishedAt(LocalDate.parse(body.getOrDefault("publishedAt", LocalDate.now().toString())));
        n.setIsActive(true);
        return ResponseEntity.ok(noticeRepository.save(n));
    }

    @DeleteMapping("/notices/{id}")
    public ResponseEntity<?> deleteNotice(@PathVariable long id) {
        User me = currentUser();
        if (!me.isAdmin()) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        noticeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    // ============================================================
    // COMPLAINTS (Officer/Admin)
    // ============================================================

    /** View all complaints (not just the logged-in user's). */
    @GetMapping("/complaints")
    public ResponseEntity<?> allComplaints() {
        User me = currentUser();
        if (!me.isOfficerOrAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Officer or Admin only"));
        }
        return ResponseEntity.ok(complaintRepository.findAll());
    }

    /** Update a complaint's status, priority, department, or officer. */
    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<?> updateComplaintStatus(@PathVariable long id,
                                                   @RequestBody Map<String, String> body) {
        User me = currentUser();
        if (!me.isOfficerOrAdmin()) {
            return ResponseEntity.status(403).body(Map.of("error", "Officer or Admin only"));
        }
        return complaintRepository.findById(id).map(c -> {
            if (body.containsKey("status"))     c.setStatus(body.get("status"));
            if (body.containsKey("priority"))   c.setPriority(body.get("priority"));
            if (body.containsKey("department")) c.setDepartment(body.get("department"));
            if (body.containsKey("assignedOfficer")) c.setAssignedOfficer(body.get("assignedOfficer"));

            var updatedComplaint = complaintRepository.save(c);
            return ResponseEntity.ok(updatedComplaint);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ============================================================
    // USERS (Admin only) — list all citizens
    // ============================================================

    @GetMapping("/users")
    public ResponseEntity<?> allUsers() {
        User me = currentUser();
        if (!me.isAdmin()) return ResponseEntity.status(403).body(Map.of("error", "Admin only"));
        List<User> users = userRepository.findAll();
        // strip password hashes
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(users);
    }
}