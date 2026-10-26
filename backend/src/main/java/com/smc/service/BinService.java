package com.smc.service;

import com.smc.dto.BinDataRequest;
import com.smc.dto.BinResponse;
import com.smc.dto.CreateBinRequest;
import com.smc.entity.Bin;
import com.smc.entity.BinReading;
import com.smc.repository.BinReadingRepository;
import com.smc.repository.BinRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@SuppressWarnings("null")
public class BinService {

    private final BinRepository binRepository;
    private final BinReadingRepository binReadingRepository;

    public BinService(BinRepository binRepository, BinReadingRepository binReadingRepository) {
        this.binRepository = binRepository;
        this.binReadingRepository = binReadingRepository;
    }

    @Transactional
    public void receiveData(BinDataRequest request) {
        Bin bin = binRepository.findById(request.getBinId()).orElse(null);
        if (bin == null) {
            System.out.println("[WARN] Received data for unregistered bin: " + request.getBinId() + ". Ignoring.");
            return;
        }

        BinReading reading = new BinReading(
            request.getBinId(),
            request.getFillPercentage(),
            request.getDistanceCm(),
            LocalDateTime.now(),
            request.getStatus()
        );
        binReadingRepository.save(reading);

        if (request.getStatus() != null) {
            bin.setStatus(request.getStatus());
            binRepository.save(bin);
        }
    }

    public List<BinResponse> getAllBins() {
        List<Bin> bins = binRepository.findAll();
        List<BinResponse> responses = new ArrayList<>();
        for (Bin bin : bins) {
            responses.add(mapToResponse(bin));
        }
        return responses;
    }

    public BinResponse getBinById(String id) {
        Bin bin = binRepository.findById(id).orElseThrow(() -> new RuntimeException("Bin not found: " + id));
        return mapToResponse(bin);
    }

    public List<BinReading> getBinHistory(String id, int hours) {
        LocalDateTime after = LocalDateTime.now().minusHours(hours);
        return binReadingRepository.findByBinIdAndTimestampAfterOrderByTimestampAsc(id, after);
    }

    public Bin createBin(CreateBinRequest request) {
        if (request.getLatitude() < 7.39 || request.getLatitude() > 7.43 ||
            request.getLongitude() < 81.81 || request.getLongitude() > 81.84) {
            throw new RuntimeException("GPS coordinates must be within Kalmunai Municipal Council area");
        }
        if (binRepository.existsById(request.getId())) {
            throw new RuntimeException("Bin with ID " + request.getId() + " already exists");
        }

        Bin bin = new Bin();
        bin.setId(request.getId());
        bin.setName(request.getName());
        bin.setLatitude(request.getLatitude());
        bin.setLongitude(request.getLongitude());
        bin.setZone(request.getZone());
        bin.setBinHeightCm(request.getBinHeightCm());
        bin.setStatus("ACTIVE");
        return binRepository.save(bin);
    }

    public Bin updateBin(String id, Bin updatedBin) {
        Bin bin = binRepository.findById(id).orElseThrow(() -> new RuntimeException("Bin not found: " + id));
        bin.setName(updatedBin.getName());
        bin.setLatitude(updatedBin.getLatitude());
        bin.setLongitude(updatedBin.getLongitude());
        bin.setZone(updatedBin.getZone());
        bin.setBinHeightCm(updatedBin.getBinHeightCm());
        bin.setStatus(updatedBin.getStatus());
        return binRepository.save(bin);
    }

    @Transactional
    public void deleteBin(String id) {
        binReadingRepository.deleteByBinId(id);
        binRepository.deleteById(id);
    }

    private BinResponse mapToResponse(Bin bin) {
        BinResponse response = new BinResponse();
        response.setId(bin.getId());
        response.setName(bin.getName());
        response.setLatitude(bin.getLatitude());
        response.setLongitude(bin.getLongitude());
        response.setZone(bin.getZone());
        response.setBinHeightCm(bin.getBinHeightCm());
        response.setStatus(bin.getStatus());
        response.setCreatedAt(bin.getCreatedAt());
        response.setUpdatedAt(bin.getUpdatedAt());

        BinReading latestReading = binReadingRepository.findTopByBinIdOrderByTimestampDesc(bin.getId());
        if (latestReading != null) {
            response.setLatestFillPercentage(latestReading.getFillPercentage());
            response.setLastUpdated(latestReading.getTimestamp());
            response.setLatestDistanceCm(latestReading.getDistanceCm());
        }
        return response;
    }
}
