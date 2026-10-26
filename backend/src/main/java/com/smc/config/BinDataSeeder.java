package com.smc.config;

import com.smc.entity.Bin;
import com.smc.entity.BinReading;
import com.smc.repository.BinReadingRepository;
import com.smc.repository.BinRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * Seeds initial waste bin data and relocates any bins outside
 * the Kalmunai Municipal Council GPS bounds on startup.
 */
@Component
@Order(10)
public class BinDataSeeder implements CommandLineRunner {

    private final BinRepository binRepository;
    private final BinReadingRepository binReadingRepository;

    // Kalmunai Municipal Council GPS bounds
    private static final double MIN_LAT = 7.39;
    private static final double MAX_LAT = 7.43;
    private static final double MIN_LNG = 81.81;
    private static final double MAX_LNG = 81.84;

    public BinDataSeeder(BinRepository binRepository, BinReadingRepository binReadingRepository) {
        this.binRepository = binRepository;
        this.binReadingRepository = binReadingRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (binRepository.count() == 0) {
            seedBins();
            seedReadings();
        }
        // Always fix bins that ended up outside Kalmunai area
        relocateOutsideBins();
    }

    private void seedBins() {
        binRepository
                .save(new Bin("BIN-001", "Kalmunai Bus Stand Bin", 7.4130, 81.8200, "Town Center", 40.0, "ACTIVE"));
        binRepository
                .save(new Bin("BIN-002", "Main Street Market Bin", 7.4155, 81.8215, "Town Center", 40.0, "ACTIVE"));
        binRepository
                .save(new Bin("BIN-003", "Kalmunai Beach Road Bin", 7.4170, 81.8310, "Beach Side", 40.0, "ACTIVE"));
        binRepository
                .save(new Bin("BIN-004", "District Hospital Bin", 7.4195, 81.8185, "Hospital Area", 40.0, "ACTIVE"));
        binRepository.save(
                new Bin("BIN-005", "Municipal Council Office Bin", 7.4165, 81.8195, "Town Center", 40.0, "ACTIVE"));
        binRepository
                .save(new Bin("BIN-006", "Kalmunai Mosque Road Bin", 7.4145, 81.8230, "Mosque Area", 40.0, "ACTIVE"));
        binRepository.save(
                new Bin("BIN-007", "Central College Junction Bin", 7.4110, 81.8175, "School Zone", 40.0, "ACTIVE"));
        binRepository.save(new Bin("BIN-008", "Fish Market Bin", 7.4200, 81.8295, "Beach Side", 40.0, "ACTIVE"));
        binRepository.save(
                new Bin("BIN-009", "Kalmunai Railway Station Bin", 7.4085, 81.8160, "Station Area", 40.0, "ACTIVE"));
        binRepository.save(
                new Bin("BIN-010", "Periyaneelavanai Junction Bin", 7.4250, 81.8210, "North Zone", 40.0, "ACTIVE"));
        System.out.println("[SEED] Seeded 10 waste bins for Kalmunai Municipal Council");
    }

    private void relocateOutsideBins() {
        List<Bin> allBins = binRepository.findAll();
        double[][] kalmunaiLocations = {
                { 7.4120, 81.8240 },
                { 7.4180, 81.8270 },
                { 7.4100, 81.8210 },
                { 7.4210, 81.8190 },
                { 7.4140, 81.8260 },
        };
        int locationIndex = 0;

        for (Bin bin : allBins) {
            boolean outsideBounds = bin.getLatitude() == null || bin.getLongitude() == null
                    || bin.getLatitude() < MIN_LAT || bin.getLatitude() > MAX_LAT
                    || bin.getLongitude() < MIN_LNG || bin.getLongitude() > MAX_LNG;

            if (outsideBounds) {
                double[] loc = kalmunaiLocations[locationIndex % kalmunaiLocations.length];
                bin.setLatitude(loc[0]);
                bin.setLongitude(loc[1]);
                if ("Unassigned".equals(bin.getZone()) || bin.getZone() == null) {
                    bin.setZone("Town Center");
                }
                if (bin.getName() == null || "Auto-registered Bin".equals(bin.getName())) {
                    bin.setName("Kalmunai Bin " + bin.getId());
                }
                binRepository.save(bin);
                System.out.println(
                        "[DATA] Relocated bin " + bin.getId() + " to Kalmunai (" + loc[0] + ", " + loc[1] + ")");
                locationIndex++;
            }
        }
    }

    private void seedReadings() {
        Random random = new Random();
        for (int i = 1; i <= 10; i++) {
            String binId = String.format("BIN-%03d", i);
            int numReadings = 3 + random.nextInt(3); // 3 to 5 readings

            for (int j = 0; j < numReadings; j++) {
                double fillPercentage = 10 + random.nextDouble() * 85; // 10% to 95%
                double distanceCm = 40.0 * (1 - (fillPercentage / 100));
                LocalDateTime timestamp = LocalDateTime.now()
                        .minusHours(random.nextInt(24))
                        .minusMinutes(random.nextInt(60));

                BinReading reading = new BinReading(binId, fillPercentage, distanceCm, timestamp, "ACTIVE");
                binReadingRepository.save(reading);
            }
        }
        System.out.println("[SEED] Seeded initial bin readings");
    }
}
