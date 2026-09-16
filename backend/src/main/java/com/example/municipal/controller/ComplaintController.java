package com.example.municipal.controller;

import com.example.municipal.entity.Complaint;
import com.example.municipal.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @GetMapping({"", "/"})
    public Map<String, Object> getComplaintApiInfo() {
        return Map.of(
                "message", "Complaint API is running",
                "availableEndpoints", List.of(
                        "/api/complaints/all",
                        "/api/complaints/citizen/{citizenId}",
                        "/api/complaints/department/{departmentName}",
                        "/api/complaints/submit",
                        "/api/complaints/{id}/assign",
                        "/api/complaints/{id}/resolve"
                )
        );
    }

    @PostMapping("/submit")
    public Complaint submitComplaint(@RequestBody Complaint complaint) {
        return complaintService.submitComplaint(complaint);
    }

    @GetMapping("/citizen/{citizenId}")
    public List<Complaint> getCitizenHistory(@PathVariable Long citizenId) {
        return complaintService.getCitizenHistory(citizenId);
    }

    @GetMapping("/department/{departmentName}")
    public List<Complaint> getDepartmentComplaints(@PathVariable String departmentName) {
        return complaintService.getDepartmentComplaints(departmentName);
    }

    @GetMapping("/all")
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @PutMapping("/{id}/assign")
    public Complaint assignDepartment(
            @PathVariable Long id, 
            @RequestBody Map<String, String> payload) {
        return complaintService.assignDepartment(id, payload.get("departmentName"));
    }

    @PutMapping("/{id}/resolve")
    public Complaint resolveComplaint(
            @PathVariable Long id, 
            @RequestBody Map<String, String> payload) {
        return complaintService.resolveComplaint(id, payload.get("resolutionNotes"));
    }
}