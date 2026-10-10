package com.smartwaste.service;

import com.smartwaste.dto.BinResponse;
import com.smartwaste.dto.DashboardStats;
import com.smartwaste.model.Reading;
import com.smartwaste.repository.ReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private BinService binService;

    @Autowired
    private ReadingRepository readingRepository;

    public DashboardStats getStats() {
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
        List<Reading> readingsToday = readingRepository.findByTimestampAfter(startOfDay);
        long totalReadingsToday = readingsToday.size();

        DashboardStats stats = new DashboardStats();
        stats.setTotalBins(totalBins);
        stats.setActiveBins(activeBins);
        stats.setCriticalBins(criticalBins);
        stats.setWarningBins(warningBins);
        stats.setAverageFillPercentage(averageFillPercentage);
        stats.setTotalReadingsToday(totalReadingsToday);

        return stats;
    }
}
