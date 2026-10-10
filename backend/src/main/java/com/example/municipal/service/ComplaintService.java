package com.example.municipal.service;

import com.example.municipal.dto.*;
import com.example.municipal.entity.Complaint;
import com.example.municipal.entity.ComplaintStatusHistory;
import com.example.municipal.enums.ComplaintStatus;
import com.example.municipal.enums.Department;
import com.example.municipal.repository.ComplaintRepository;
import com.example.municipal.repository.ComplaintStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintStatusHistoryRepository historyRepository;
    private final FileStorageService fileStorageService;

    // ================= CITIZEN =================

    @Transactional
    public ComplaintResponse submit(Long citizenId, CreateComplaintRequest req,
                                    MultipartFile file) {
        Complaint c = new Complaint();
        c.setCitizenId(citizenId);
        c.setTitle(req.title().trim());
        c.setCategory(req.category());
        c.setDescription(req.description().trim());
        c.setLocation(req.location().trim());
        c.setLatitude(req.latitude());
        c.setLongitude(req.longitude());

        if (file != null && !file.isEmpty()) {
            c.setImageUrl(fileStorageService.save(file));
        }

        c = complaintRepository.save(c);
        c.setTicketNo(String.format("KMC-%d-%06d", Year.now().getValue(), c.getId()));
        log(c, "Complaint submitted", "citizen");

        return ComplaintResponse.from(c);
    }

    public List<ComplaintResponse> myComplaints(Long citizenId) {
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(citizenId)
                .stream().map(ComplaintResponse::from).toList();
    }

    public TrackResponse track(String ticketNo) {
        Complaint c = complaintRepository.findByTicketNo(ticketNo.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ticket not found"));

        List<HistoryItem> timeline = historyRepository
                .findByComplaintIdOrderByChangedAtAsc(c.getId()).stream()
                .map(h -> new HistoryItem(h.getStatus(), h.getNote(), h.getChangedAt()))
                .toList();

        return new TrackResponse(c.getTicketNo(), c.getTitle(), c.getLocation(),
                c.getStatus(), c.getDepartment(), c.getCreatedAt(), timeline);
    }

    // ================= ADMIN =================

    public PageResponse<ComplaintResponse> search(ComplaintStatus status, Department department,
                                                  String q, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> result = complaintRepository.search(
                status != null, status,
                department != null, department,
                q == null ? "" : q.trim(),
                pageable);

        return new PageResponse<>(
                result.getContent().stream().map(ComplaintResponse::from).toList(),
                result.getNumber(), result.getTotalPages(), result.getTotalElements());
    }

    public ComplaintResponse getOne(Long id) {
        return ComplaintResponse.from(find(id));
    }

    @Transactional
    public ComplaintResponse assign(Long id, AssignRequest req) {
        Complaint c = find(id);
        ensureOpen(c);

        c.setDepartment(req.department());
        if (req.priority() != null) c.setPriority(req.priority());
        c.setAssignedAt(LocalDateTime.now());
        if (c.getStatus() == ComplaintStatus.PENDING) {
            c.setStatus(ComplaintStatus.IN_PROGRESS);
        }

        log(c, "Assigned to " + pretty(req.department()), "admin");
        return ComplaintResponse.from(c);
    }

    @Transactional
    public ComplaintResponse updateStatus(Long id, StatusUpdateRequest req) {
        Complaint c = find(id);
        ensureOpen(c);

        ComplaintStatus s = req.status();
        String note = req.note() == null ? "" : req.note().trim();
        boolean closing = s == ComplaintStatus.RESOLVED || s == ComplaintStatus.REJECTED;

        if (s == ComplaintStatus.PENDING) {
            throw bad("A complaint cannot be moved back to Pending");
        }
        if (closing && note.isEmpty()) {
            throw bad("Please write a note before closing the complaint");
        }
        if (s == ComplaintStatus.IN_PROGRESS && c.getDepartment() == null) {
            throw bad("Assign a department first");
        }

        c.setStatus(s);
        if (closing) {
            c.setResolvedAt(LocalDateTime.now());
            c.setResolutionNotes(note);
        }

        String historyNote = note.isEmpty() ? "Work has started" : note;
        log(c, historyNote, "admin");
        return ComplaintResponse.from(c);
    }

    public StatsResponse stats() {
        long total = complaintRepository.count();
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        double rate = total == 0 ? 0 : Math.round(resolved * 1000.0 / total) / 10.0;

        return new StatsResponse(
                total,
                complaintRepository.countByStatus(ComplaintStatus.PENDING),
                complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS),
                resolved,
                complaintRepository.countByStatus(ComplaintStatus.REJECTED),
                rate);
    }

    // ================= HELPERS =================

    private Complaint find(Long id) {
        return complaintRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Complaint " + id + " not found"));
    }

    private void ensureOpen(Complaint c) {
        if (c.getStatus() == ComplaintStatus.RESOLVED || c.getStatus() == ComplaintStatus.REJECTED) {
            throw bad("This complaint is already closed");
        }
    }

    private ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private String pretty(Enum<?> value) {
        String s = value.name().replace('_', ' ').toLowerCase();
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private void log(Complaint c, String note, String by) {
        ComplaintStatusHistory h = new ComplaintStatusHistory();
        h.setComplaintId(c.getId());
        h.setStatus(c.getStatus());
        h.setNote(note);
        h.setChangedBy(by);
        historyRepository.save(h);
    }
}