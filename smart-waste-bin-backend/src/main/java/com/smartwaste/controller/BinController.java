package com.smartwaste.controller;

import com.smartwaste.dto.BinDataRequest;
import com.smartwaste.dto.BinResponse;
import com.smartwaste.model.Bin;
import com.smartwaste.model.Reading;
import com.smartwaste.service.BinService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bins")
public class BinController {

    @Autowired
    private BinService binService;

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
    public ResponseEntity<List<Reading>> getBinHistory(@PathVariable String id, @RequestParam(defaultValue = "24") int hours) {
        return ResponseEntity.ok(binService.getBinHistory(id, hours));
    }

    @PostMapping
    public ResponseEntity<Bin> registerBin(@RequestBody com.smartwaste.dto.CreateBinRequest request) {
        return ResponseEntity.ok(binService.createBin(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bin> updateBin(@PathVariable String id, @RequestBody Bin bin) {
        return ResponseEntity.ok(binService.updateBin(id, bin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBin(@PathVariable String id) {
        binService.deleteBin(id);
        return ResponseEntity.ok().build();
    }
}
