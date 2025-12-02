package com.hospital.repository;

import com.hospital.model.Island;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IslandRepository extends JpaRepository<Island, Long> {
    Optional<Island> findByName(String name);
    boolean existsByName(String name);
}

