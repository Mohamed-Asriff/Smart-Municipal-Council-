package com.smartwaste.repository;

import com.smartwaste.model.Bin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BinRepository extends JpaRepository<Bin, String> {
    List<Bin> findByStatus(String status);
    List<Bin> findByZone(String zone);
}
