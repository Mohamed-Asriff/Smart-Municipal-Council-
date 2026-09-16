package com.example.municipal.service;

import com.example.municipal.entity.Complaint;
import com.example.municipal.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public Complaint submitComplaint(Complaint complaint) {
        complaint.setStatus("Pending");
        complaint.setDepartmentName("Unassigned");
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getCitizenHistory(Long citizenId) {
        return complaintRepository.findByCitizenId(citizenId);
    }

    public List<Complaint> getDepartmentComplaints(String departmentName) {
        return complaintRepository.findByDepartmentName(departmentName);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public Complaint getComplaintOrThrow(Long complaintId) {
        return complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Complaint " + complaintId + " not found"));
    }

    public Complaint assignDepartment(Long complaintId, String departmentName) {
        Complaint complaint = getComplaintOrThrow(complaintId);
        complaint.setDepartmentName(departmentName);
        complaint.setStatus("In Progress");
        complaint.setAssignedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }

    public Complaint resolveComplaint(Long complaintId, String resolutionNotes) {
        Complaint complaint = getComplaintOrThrow(complaintId);
        complaint.setStatus("Resolved");
        complaint.setResolutionNotes(resolutionNotes);
        return complaintRepository.save(complaint);
    }
}