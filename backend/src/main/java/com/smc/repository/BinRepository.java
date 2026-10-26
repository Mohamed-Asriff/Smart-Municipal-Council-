package com.smc.repository;

import com.smc.entity.Bin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BinRepository extends JpaRepository<Bin, String> {
    List<Bin> findByStatus(String status);
    List<Bin> findByZone(String zone);
}
