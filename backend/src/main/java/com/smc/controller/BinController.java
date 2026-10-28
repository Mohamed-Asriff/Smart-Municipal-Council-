package com.smc.controller;

import com.smc.dto.BinDataRequest;
import com.smc.dto.BinResponse;
import com.smc.dto.CreateBinRequest;
import com.smc.entity.Bin;
import com.smc.entity.BinReading;
import com.smc.service.BinService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bins")
public class BinController {

    private final BinService binService;

    public BinController(BinService binService) {
        this.binService = binService;
    }

    /**
     * IoT device endpoint — receives fill-level data from ESP32/sensors.
     * Permitted without auth token (device does not have user context).
     */
    @PostMapping("/data")
    public ResponseEntity<Void> receiveData(@RequestBody BinDataRequest request) {
        binService.receiveData(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<BinResponse>> getAllBins() {
        return ResponseEntity.ok(binService.getAllBins());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BinResponse> getBinById(@PathVariable String id) {
        return ResponseEntity.ok(binService.getBinById(id));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<BinReading>> getBinHistory(
            @PathVariable String id,
            @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(binService.getBinHistory(id, hours));
    }

    @PostMapping
    public ResponseEntity<?> registerBin(@RequestBody CreateBinRequest request) {
        try {
            Bin bin = binService.createBin(request);
            return ResponseEntity.ok(bin);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBin(@PathVariable String id, @RequestBody Bin bin) {
        try {
            return ResponseEntity.ok(binService.updateBin(id, bin));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBin(@PathVariable String id) {
        binService.deleteBin(id);
        return ResponseEntity.ok().build();
    }
}
