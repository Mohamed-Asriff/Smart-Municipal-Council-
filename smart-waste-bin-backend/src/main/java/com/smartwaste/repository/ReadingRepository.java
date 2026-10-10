package com.smartwaste.repository;

import com.smartwaste.model.Reading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReadingRepository extends JpaRepository<Reading, Long> {
    List<Reading> findByBinIdOrderByTimestampDesc(String binId);
    Reading findTopByBinIdOrderByTimestampDesc(String binId);
    List<Reading> findByBinIdAndTimestampAfterOrderByTimestampAsc(String binId, LocalDateTime after);
    List<Reading> findByTimestampAfter(LocalDateTime after);
    void deleteByBinId(String binId);
}
