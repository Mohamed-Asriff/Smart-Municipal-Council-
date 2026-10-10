package com.smartwaste.service;

import com.smartwaste.dto.BinDataRequest;
import com.smartwaste.dto.BinResponse;
import com.smartwaste.model.Bin;
import com.smartwaste.model.Reading;
import com.smartwaste.repository.BinRepository;
import com.smartwaste.repository.ReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BinService {

    @Autowired
    private BinRepository binRepository;

    @Autowired
    private ReadingRepository readingRepository;

    @Transactional
    public void receiveData(BinDataRequest request) {
        Bin bin = binRepository.findById(request.getBinId()).orElse(null);
        if (bin == null) {
            System.out.println("[WARN] Received data for unregistered bin: " + request.getBinId() + ". Ignoring.");
            return;
        }

        Reading reading = new Reading(request.getBinId(), request.getFillPercentage(), request.getDistanceCm(), LocalDateTime.now(), request.getStatus());
        readingRepository.save(reading);

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
        Bin bin = binRepository.findById(id).orElseThrow(() -> new RuntimeException("Bin not found"));
        return mapToResponse(bin);
    }

    public List<Reading> getBinHistory(String id, int hours) {
        LocalDateTime after = LocalDateTime.now().minusHours(hours);
        return readingRepository.findByBinIdAndTimestampAfterOrderByTimestampAsc(id, after);
    }

    public Bin createBin(com.smartwaste.dto.CreateBinRequest request) {
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

    public Bin registerBin(Bin bin) {
        return binRepository.save(bin);
    }

    public Bin updateBin(String id, Bin updatedBin) {
        Bin bin = binRepository.findById(id).orElseThrow(() -> new RuntimeException("Bin not found"));
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
        readingRepository.deleteByBinId(id);
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

        Reading latestReading = readingRepository.findTopByBinIdOrderByTimestampDesc(bin.getId());
        if (latestReading != null) {
            response.setLatestFillPercentage(latestReading.getFillPercentage());
            response.setLastUpdated(latestReading.getTimestamp());
            response.setLatestDistanceCm(latestReading.getDistanceCm());
        }
        return response;
    }
}
