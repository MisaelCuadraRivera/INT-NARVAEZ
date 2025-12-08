package com.hospital.repository;

import com.hospital.model.Bed;
import com.hospital.model.Island;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByIsland(Island island);
    Optional<Bed> findByBedNumberAndIsland(String bedNumber, Island island);
    Optional<Bed> findByQrCode(String qrCode);
}


