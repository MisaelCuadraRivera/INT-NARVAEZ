package com.hospital.repository;

import com.hospital.model.Nurse;
import com.hospital.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {
    Optional<Nurse> findByUser(User user);
}


