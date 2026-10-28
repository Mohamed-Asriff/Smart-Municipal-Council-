package com.smc.controller;

import com.smc.dto.ComplaintRequest;
import com.smc.dto.ComplaintResponse;
import com.smc.dto.TrackResponse;
import com.smc.entity.Complaint;
import com.smc.entity.User;
import com.smc.repository.UserRepository;
import com.smc.service.ComplaintService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    public ComplaintController(ComplaintService complaintService, UserRepository userRepository) {
        this.complaintService = complaintService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    // ================= PUBLIC TRACKING =================

    @GetMapping(value = {"/api/complaints/track/{ticketCode}", "/api/citizen/complaints/track/{ticketCode}"})
    public ResponseEntity<TrackResponse> trackComplaint(@PathVariable String ticketCode) {
        return ResponseEntity.ok(complaintService.track(ticketCode));
    }

    // ================= CITIZEN COMPLAINTS =================

    @GetMapping("/api/complaints")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {
        User user = getAuthenticatedUser();
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(complaintService.getComplaintsByUser(user.getId()).stream().map(ComplaintResponse::from).toList());
    }

    @GetMapping("/api/citizen/complaints/{citizenId}")
    public ResponseEntity<List<ComplaintResponse>> getCitizenComplaints(@PathVariable Long citizenId) {
        List<Complaint> list = complaintService.getComplaintsByUser(citizenId);
        return ResponseEntity.ok(list.stream().map(ComplaintResponse::from).toList());
    }

    @GetMapping("/api/complaints/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(ComplaintResponse.from(complaintService.getById(id)));
    }

    // ================= SUBMISSION =================

    // JSON Submission
    @PostMapping(value = "/api/complaints", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ComplaintResponse> createComplaintJson(@RequestBody ComplaintRequest request) {
        User user = getAuthenticatedUser();
        Complaint created = complaintService.submitComplaint(user, request, null);
        return ResponseEntity.ok(ComplaintResponse.from(created));
    }

    // Multipart Submission (with photo evidence)
    @PostMapping(value = "/api/complaints", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintResponse> createComplaintMultipart(
            @ModelAttribute ComplaintRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        User user = getAuthenticatedUser();
        Complaint created = complaintService.submitComplaint(user, request, file);
        return ResponseEntity.ok(ComplaintResponse.from(created));
    }

    // Comp branch compatibility endpoint
    @PostMapping(value = "/api/citizen/complaints", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ComplaintResponse> createCitizenComplaintMultipart(
            @ModelAttribute ComplaintRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        User user = getAuthenticatedUser();
        Complaint created = complaintService.submitComplaint(user, request, file);
        return ResponseEntity.ok(ComplaintResponse.from(created));
    }
}
