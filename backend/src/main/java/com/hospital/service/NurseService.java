package com.hospital.service;

import com.hospital.dto.IslandDTO;
import com.hospital.dto.NurseDTO;
import com.hospital.model.*;
import com.hospital.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NurseService {
    
    @Autowired
    private NurseRepository nurseRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private IslandRepository islandRepository;
    
    public List<NurseDTO> getAllNurses() {
        return nurseRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public NurseDTO getNurseById(Long id) {
        Nurse nurse = nurseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Enfermero no encontrado"));
        return convertToDTO(nurse);
    }
    
    @Transactional
    public NurseDTO createNurse(NurseDTO nurseDTO) {
        User user = userRepository.findById(nurseDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Si el usuario aún no tiene rol de enfermero, lo convertimos a enfermero
        // (flujo típico cuando el admin crea primero el usuario y luego el enfermero)
        if (user.getRole() != Role.NURSE) {
            user.setRole(Role.NURSE);
            userRepository.save(user);
        }
        
        Nurse nurse = new Nurse();
        nurse.setUser(user);
        nurse.setLicenseNumber(nurseDTO.getLicenseNumber());
        nurse.setSpecialization(nurseDTO.getSpecialization());
        
        return convertToDTO(nurseRepository.save(nurse));
    }
    
    @Transactional
    public NurseDTO updateNurse(Long id, NurseDTO nurseDTO) {
        Nurse nurse = nurseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Enfermero no encontrado"));
        
        nurse.setLicenseNumber(nurseDTO.getLicenseNumber());
        nurse.setSpecialization(nurseDTO.getSpecialization());
        
        return convertToDTO(nurseRepository.save(nurse));
    }
    
    @Transactional
    public NurseDTO assignIslandsToNurse(Long nurseId, List<Long> islandIds) {
        Nurse nurse = nurseRepository.findById(nurseId)
            .orElseThrow(() -> new RuntimeException("Enfermero no encontrado"));
        
        List<Island> islands = islandRepository.findAllById(islandIds);
        nurse.setAssignedIslands(islands);
        
        return convertToDTO(nurseRepository.save(nurse));
    }
    
    private NurseDTO convertToDTO(Nurse nurse) {
        NurseDTO dto = new NurseDTO();
        dto.setId(nurse.getId());
        dto.setUserId(nurse.getUser().getId());
        dto.setUsername(nurse.getUser().getUsername());
        dto.setFullName(nurse.getUser().getFullName());
        dto.setEmail(nurse.getUser().getEmail());
        dto.setLicenseNumber(nurse.getLicenseNumber());
        dto.setSpecialization(nurse.getSpecialization());
        
        List<IslandDTO> islands = nurse.getAssignedIslands().stream()
            .map(island -> {
                IslandDTO islandDTO = new IslandDTO();
                islandDTO.setId(island.getId());
                islandDTO.setName(island.getName());
                islandDTO.setDescription(island.getDescription());
                return islandDTO;
            })
            .collect(Collectors.toList());
        dto.setAssignedIslands(islands);
        
        return dto;
    }
}

