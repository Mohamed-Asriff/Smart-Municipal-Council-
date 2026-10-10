package com.example.municipal.controller;

import com.example.municipal.dto.*;
import com.example.municipal.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CitizenComplaintController {

    private final ComplaintService complaintService;

    private static final Long TEMP_CITIZEN_ID = 1L;

    @PostMapping(value = "/api/citizen/complaints",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ComplaintResponse submit(
            @RequestPart("data") @Valid CreateComplaintRequest data,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        return complaintService.submit(TEMP_CITIZEN_ID, data, photo);
    }

    @GetMapping("/api/citizen/complaints")
    public List<ComplaintResponse> myComplaints() {
        return complaintService.myComplaints(TEMP_CITIZEN_ID);
    }

    @GetMapping("/api/complaints/track/{ticketNo}")
    public TrackResponse track(@PathVariable String ticketNo) {
        return complaintService.track(ticketNo);
    }
}