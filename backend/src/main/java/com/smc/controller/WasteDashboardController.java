package com.smc.controller;

import com.smc.dto.WasteDashboardStats;
import com.smc.service.WasteDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/waste-dashboard")
public class WasteDashboardController {

    private final WasteDashboardService wasteDashboardService;

    public WasteDashboardController(WasteDashboardService wasteDashboardService) {
        this.wasteDashboardService = wasteDashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<WasteDashboardStats> getStats() {
        return ResponseEntity.ok(wasteDashboardService.getStats());
    }
}
