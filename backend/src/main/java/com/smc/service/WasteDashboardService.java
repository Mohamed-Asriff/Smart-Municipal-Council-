package com.smc.service;

import com.smc.dto.BinResponse;
import com.smc.dto.WasteDashboardStats;
import com.smc.entity.BinReading;
import com.smc.repository.BinReadingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class WasteDashboardService {

    private final BinService binService;
    private final BinReadingRepository binReadingRepository;

    public WasteDashboardService(BinService binService, BinReadingRepository binReadingRepository) {
        this.binService = binService;
        this.binReadingRepository = binReadingRepository;
    }

    public WasteDashboardStats getStats() {
        List<BinResponse> allBins = binService.getAllBins();

        long totalBins = allBins.size();
        long activeBins = 0;
        long criticalBins = 0;
        long warningBins = 0;
        double sumFillPercentage = 0;
        int countFilledBins = 0;

        for (BinResponse bin : allBins) {
            if ("ACTIVE".equalsIgnoreCase(bin.getStatus())) {
                activeBins++;
            }
            if (bin.getLatestFillPercentage() != null) {
                double fill = bin.getLatestFillPercentage();
                if (fill > 85.0) {
                    criticalBins++;
                } else if (fill >= 70.0) {
                    warningBins++;
                }
                sumFillPercentage += fill;
                countFilledBins++;
            }
        }

        double averageFillPercentage = countFilledBins > 0 ? sumFillPercentage / countFilledBins : 0;

        LocalDateTime startOfDay = LocalDateTime.now().with(LocalTime.MIN);
        List<BinReading> readingsToday = binReadingRepository.findByTimestampAfter(startOfDay);
        long totalReadingsToday = readingsToday.size();

        WasteDashboardStats stats = new WasteDashboardStats();
        stats.setTotalBins(totalBins);
        stats.setActiveBins(activeBins);
        stats.setCriticalBins(criticalBins);
        stats.setWarningBins(warningBins);
        stats.setAverageFillPercentage(averageFillPercentage);
        stats.setTotalReadingsToday(totalReadingsToday);

        return stats;
    }
}
