package com.example.municipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:3000")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;

    public ComplaintController(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    // 1. Get all complaints (for Staff Dashboard)
    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // 2. Submit a new complaint (for Citizen Dashboard)
    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        return complaintRepository.save(complaint);
    }

    // 3. Update complaint status (for Staff review)
    @PutMapping("/{id}/status")
    public Complaint updateStatus(@PathVariable Long id, @RequestBody Complaint updatedComplaint) {
        Complaint complaint = complaintRepository.findById(id).orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(updatedComplaint.getStatus());
        return complaintRepository.save(complaint);
    }
}