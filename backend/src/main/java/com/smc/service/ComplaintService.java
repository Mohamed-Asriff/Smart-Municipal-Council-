package com.smc.service;

import com.smc.dto.*;
import com.smc.entity.Complaint;
import com.smc.entity.ComplaintStatusHistory;
import com.smc.entity.ComplaintTimeline;
import com.smc.entity.User;
import com.smc.repository.ComplaintRepository;
import com.smc.repository.ComplaintStatusHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@SuppressWarnings("null")
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final FileStorageService fileStorageService;

    public ComplaintService(ComplaintRepository complaintRepository,
                            ComplaintStatusHistoryRepository historyRepository,
                            FileStorageService fileStorageService) {
        this.complaintRepository = complaintRepository;
        this.historyRepository = historyRepository;
        this.fileStorageService = fileStorageService;
    }

    // ================= CITIZEN SUBMIT =================

    @Transactional
    public Complaint submitComplaint(User user, ComplaintRequest req, MultipartFile file) {
        Complaint c = new Complaint();
        c.setTicketCode("KMC-" + ZonedDateTime.now().getYear() + "-" + (int)(Math.random() * 9000 + 1000));
        c.setUser(user);
        c.setTitle(req.getTitle() != null ? req.getTitle().trim() : "Municipal Concern");
        c.setCategory(req.getCategory() != null ? req.getCategory().trim() : "Other");
        c.setDescription(req.getDescription() != null ? req.getDescription().trim() : "");
        c.setZone(req.getZone() != null ? req.getZone().trim() : (user != null ? user.getZone() : "Kalmunai Zone"));
        c.setLocation(req.getLocation() != null ? req.getLocation().trim() : "");
        c.setLatitude(req.getLatitude());
        c.setLongitude(req.getLongitude());
        c.setPriority(req.getPriority() != null ? req.getPriority().trim() : "Medium");
        c.setStatus("Submitted");
        c.setDepartment(req.getDepartment() != null ? req.getDepartment().trim() : "Public Works");
        c.setAssignedOfficer("Pending Assignment");
        c.setSubmittedAt(ZonedDateTime.now());
        c.setCreatedAt(ZonedDateTime.now());
        c.setUpdatedAt(ZonedDateTime.now());

        if (file != null && !file.isEmpty()) {
            c.setPhotoUrl(fileStorageService.storeFile(file));
        }

        // Initialize default timeline steps
        List<ComplaintTimeline> timelines = new ArrayList<>();
        timelines.add(createTimeline(c, "Ticket Logged in SMC System", "Just now", true, 1));
        timelines.add(createTimeline(c, "Verification & Department Triage", "Within 4h", false, 2));
        timelines.add(createTimeline(c, "Technical Field Crew Inspection", "Within 24h", false, 3));
        timelines.add(createTimeline(c, "Rectification Work Executed", "Within 48h", false, 4));
        timelines.add(createTimeline(c, "Closure Verification & Sign-off", "On completion", false, 5));
        c.setTimeline(timelines);

        Complaint saved = complaintRepository.save(c);

        // Record initial status history audit
        logAudit(saved, "Complaint submitted by " + (user != null ? user.getName() : "citizen"), "citizen");

        return saved;
    }

    private ComplaintTimeline createTimeline(Complaint c, String step, String time, boolean done, int seq) {
        ComplaintTimeline t = new ComplaintTimeline();
        t.setComplaint(c);
        t.setStep(step);
        t.setStepTime(time);
        t.setDone(done);
        t.setSequenceNo(seq);
        t.setCreatedAt(ZonedDateTime.now());
        return t;
    }

    // ================= CITIZEN LIST & TRACK =================

    public List<Complaint> getComplaintsByUser(Long userId) {
        return complaintRepository.findByUserIdOrderBySubmittedAtDesc(userId);
    }

    public TrackResponse track(String ticketCode) {
        Complaint c = complaintRepository.findByTicketCodeIgnoreCase(ticketCode.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found: " + ticketCode));

        List<HistoryItem> history = historyRepository.findByComplaintIdOrderByChangedAtAsc(c.getId())
                .stream()
                .map(h -> new HistoryItem(h.getStatus(), h.getNote(), h.getChangedBy(), h.getChangedAt()))
                .toList();

        return new TrackResponse(
                c.getTicketCode(),
                c.getTicketCode(),
                c.getTitle(),
                c.getCategory(),
                c.getLocation(),
                c.getStatus(),
                c.getPriority(),
                c.getDepartment(),
                c.getAssignedOfficer(),
                c.getPhotoUrl(),
                c.getPhotoUrl(),
                c.getCreatedAt(),
                history,
                c.getTimeline()
        );
    }

    public Complaint getById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found: " + id));
    }

    // ================= ADMIN OPERATIONS =================

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public PageResponse<ComplaintResponse> searchComplaints(String status, String category, String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        boolean filterStatus = status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL");
        boolean filterCategory = category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL");

        Page<Complaint> result = complaintRepository.search(
                filterStatus,
                status != null ? status.trim() : "",
                filterCategory,
                category != null ? category.trim() : "",
                q == null ? "" : q.trim(),
                pageable
        );

        List<ComplaintResponse> items = result.getContent().stream()
                .map(ComplaintResponse::from)
                .toList();

        return new PageResponse<>(items, result.getNumber(), result.getTotalPages(), result.getTotalElements());
    }

    @Transactional
    public Complaint assign(Long id, AssignRequest req, String adminName) {
        Complaint c = getById(id);

        if (req.department() != null && !req.department().isBlank()) {
            c.setDepartment(req.department().trim());
        }
        if (req.priority() != null && !req.priority().isBlank()) {
            c.setPriority(req.priority().trim());
        }
        if (req.assignedOfficer() != null && !req.assignedOfficer().isBlank()) {
            c.setAssignedOfficer(req.assignedOfficer().trim());
        }
        c.setAssignedAt(ZonedDateTime.now());

        if ("Submitted".equalsIgnoreCase(c.getStatus()) || "Pending".equalsIgnoreCase(c.getStatus())) {
            c.setStatus("In Progress");
            advanceTimeline(c, 2);
        }

        logAudit(c, "Assigned to " + c.getDepartment() + " (" + (c.getAssignedOfficer() != null ? c.getAssignedOfficer() : "Team") + ")", adminName);
        return complaintRepository.save(c);
    }

    @Transactional
    public Complaint updateStatus(Long id, StatusUpdateRequest req, String adminName) {
        Complaint c = getById(id);

        if (req.status() != null && !req.status().isBlank()) {
            c.setStatus(req.status().trim());
        }
        if (req.priority() != null && !req.priority().isBlank()) {
            c.setPriority(req.priority().trim());
        }
        if (req.department() != null && !req.department().isBlank()) {
            c.setDepartment(req.department().trim());
        }
        if (req.assignedOfficer() != null && !req.assignedOfficer().isBlank()) {
            c.setAssignedOfficer(req.assignedOfficer().trim());
        }

        String note = req.note() != null ? req.note().trim() : "";
        if ("Resolved".equalsIgnoreCase(c.getStatus()) || "Closed".equalsIgnoreCase(c.getStatus())) {
            c.setResolvedAt(ZonedDateTime.now());
            c.setResolutionNotes(note);
            completeAllTimeline(c);
        } else if ("In Progress".equalsIgnoreCase(c.getStatus()) || "Dispatched".equalsIgnoreCase(c.getStatus())) {
            advanceTimeline(c, 3);
        }

        logAudit(c, note.isEmpty() ? "Status updated to " + c.getStatus() : note, adminName);
        return complaintRepository.save(c);
    }

    public StatsResponse getStats() {
        long total = complaintRepository.count();
        long pending = complaintRepository.countByStatus("Submitted") + complaintRepository.countByStatus("Pending");
        long inProgress = complaintRepository.countByStatus("In Progress") + complaintRepository.countByStatus("Dispatched");
        long resolved = complaintRepository.countByStatus("Resolved") + complaintRepository.countByStatus("Closed");
        long rejected = complaintRepository.countByStatus("Rejected");
        double rate = total == 0 ? 0.0 : Math.round(resolved * 1000.0 / total) / 10.0;

        return new StatsResponse(total, pending, inProgress, resolved, rejected, rate);
    }

    // ================= AUDIT & TIMELINE HELPERS =================

    private void logAudit(Complaint c, String note, String by) {
        ComplaintStatusHistory h = new ComplaintStatusHistory();
        h.setComplaint(c);
        h.setStatus(c.getStatus());
        h.setNote(note);
        h.setChangedBy(by != null ? by : "System");
        h.setChangedAt(ZonedDateTime.now());
        historyRepository.save(h);
    }

    private void advanceTimeline(Complaint c, int upToSequence) {
        if (c.getTimeline() == null) return;
        for (ComplaintTimeline step : c.getTimeline()) {
            if (step.getSequenceNo() <= upToSequence) {
                step.setDone(true);
            }
        }
    }

    private void completeAllTimeline(Complaint c) {
        if (c.getTimeline() == null) return;
        for (ComplaintTimeline step : c.getTimeline()) {
            step.setDone(true);
        }
    }
}
