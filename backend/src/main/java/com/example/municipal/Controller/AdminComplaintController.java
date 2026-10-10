package com.example.municipal.controller;

import com.example.municipal.dto.*;
import com.example.municipal.enums.ComplaintStatus;
import com.example.municipal.enums.Department;
import com.example.municipal.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/complaints")
@RequiredArgsConstructor
public class AdminComplaintController {

    private final ComplaintService complaintService;

    @GetMapping
    public PageResponse<ComplaintResponse> list(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) Department department,
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return complaintService.search(status, department, q, page, size);
    }

    @GetMapping("/stats")
    public StatsResponse stats() {
        return complaintService.stats();
    }

    @GetMapping("/{id}")
    public ComplaintResponse one(@PathVariable Long id) {
        return complaintService.getOne(id);
    }

    @PatchMapping("/{id}/assign")
    public ComplaintResponse assign(@PathVariable Long id,
                                    @RequestBody @Valid AssignRequest request) {
        return complaintService.assign(id, request);
    }

    @PatchMapping("/{id}/status")
    public ComplaintResponse status(@PathVariable Long id,
                                    @RequestBody @Valid StatusUpdateRequest request) {
        return complaintService.updateStatus(id, request);
    }
}