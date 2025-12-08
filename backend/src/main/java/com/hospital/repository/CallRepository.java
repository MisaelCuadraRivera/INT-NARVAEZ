package com.hospital.repository;

import com.hospital.model.Call;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {
    List<Call> findByNurseIdAndStatus(Long nurseId, String status);
    List<Call> findByNurseIdAndStatusIn(Long nurseId, java.util.List<String> statuses);
    List<Call> findByBedIdAndStatusOrderByCreatedAtDesc(Long bedId, String status);
    List<Call> findByNurseIdAndStatusOrderByCreatedAtDesc(Long nurseId, String status);
    List<Call> findByCreatedAtAfter(LocalDateTime since);
}
