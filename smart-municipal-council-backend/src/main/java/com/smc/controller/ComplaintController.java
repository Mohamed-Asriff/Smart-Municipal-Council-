package com.smc.controller;

import com.smc.dto.ComplaintRequest;
import com.smc.entity.Complaint;
import com.smc.entity.User;
import com.smc.repository.ComplaintRepository;
import com.smc.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    public ComplaintController(ComplaintRepository complaintRepository, UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/track/{ticketCode}")
    public ResponseEntity<?> trackComplaint(@PathVariable String ticketCode) {
        return complaintRepository.findAll().stream()
                .filter(c -> c.getTicketCode().equalsIgnoreCase(ticketCode))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Complaint>> getUserComplaints() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(complaintRepository.findByUserIdOrderBySubmittedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody ComplaintRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Complaint complaint = new Complaint();
        complaint.setTicketCode("SMC-2026-" + (int)(Math.random() * 9000 + 1000));
        complaint.setUser(user);
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setCategory(request.getCategory());
        complaint.setZone(request.getZone());
        complaint.setLocation(request.getLocation());
        complaint.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        complaint.setStatus("Submitted");
        complaint.setDepartment("Public Works");
        complaint.setAssignedOfficer("Dispatch Crew Assigned");

        return ResponseEntity.ok(complaintRepository.save(complaint));
    }
}