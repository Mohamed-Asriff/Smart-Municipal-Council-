package com.smc.repository;

import com.smc.entity.BinReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BinReadingRepository extends JpaRepository<BinReading, Long> {
    List<BinReading> findByBinIdOrderByTimestampDesc(String binId);
    BinReading findTopByBinIdOrderByTimestampDesc(String binId);
    List<BinReading> findByBinIdAndTimestampAfterOrderByTimestampAsc(String binId, LocalDateTime after);
    List<BinReading> findByTimestampAfter(LocalDateTime after);
    void deleteByBinId(String binId);
}
