package com.hospital.repository;

import com.hospital.model.Nurse;
import com.hospital.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {

    Optional<Nurse> findByUser(User user);

    // --- AQUÍ ESTÁ EL ARREGLO ---
    // Este método permite buscar al enfermero usando el ID del LOGIN (Usuario 5)
    // en lugar del ID de la tabla de enfermeros (Enfermero 2).
    Optional<Nurse> findByUserId(Long userId);
}