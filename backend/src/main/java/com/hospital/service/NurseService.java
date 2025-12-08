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
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    
    @Autowired
    private IslandRepository islandRepository;
    
    @Autowired
    private BedRepository bedRepository;
    
    @Autowired
    private PatientRepository patientRepository;
    
    public List<NurseDTO> getAllNurses() {
        return nurseRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public NurseDTO getNurseById(Long id) {
        // Intentar buscar por nurseId primero, si no existe, buscar por userId
        Nurse nurse = nurseRepository.findById(id)
            .orElseGet(() -> nurseRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Enfermero no encontrado con ID: " + id)));
        return convertToDTO(nurse);
    }
    
    @Transactional
    public NurseDTO createNurse(NurseDTO nurseDTO) {
        User user;

        if (nurseDTO.getUserId() != null) {
            user = userRepository.findById(nurseDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + nurseDTO.getUserId()));

            if (user.getRole() != Role.NURSE) {
                user.setRole(Role.NURSE);
                userRepository.save(user);
            }
        }
        // Si no se proporciona userId, permitir crear el usuario automáticamente (similar a PatientService)
        else if (nurseDTO.getUsername() != null && !nurseDTO.getUsername().trim().isEmpty()) {
            if (userRepository.existsByUsername(nurseDTO.getUsername())) {
                throw new RuntimeException("El nombre de usuario ya existe: " + nurseDTO.getUsername());
            }

            if (nurseDTO.getEmail() != null && !nurseDTO.getEmail().trim().isEmpty()) {
                if (userRepository.existsByEmail(nurseDTO.getEmail())) {
                    throw new RuntimeException("El email ya está registrado: " + nurseDTO.getEmail());
                }
            }

            user = new User();
            user.setUsername(nurseDTO.getUsername());
            user.setFullName(nurseDTO.getFullName() != null ? nurseDTO.getFullName() : nurseDTO.getUsername());
            user.setEmail(nurseDTO.getEmail() != null ? nurseDTO.getEmail() : nurseDTO.getUsername() + "@hospital.com");
            user.setPassword(passwordEncoder.encode(nurseDTO.getPassword() != null ? nurseDTO.getPassword() : "enfermero123"));
            user.setRole(Role.NURSE);
            user = userRepository.save(user);
        } else {
            throw new RuntimeException("Debe proporcionar un ID de usuario existente o los datos para crear un nuevo usuario (username, fullName, email)");
        }
        
        Nurse nurse = new Nurse();
        nurse.setUser(user);
        nurse.setLicenseNumber(nurseDTO.getLicenseNumber());
        nurse.setSpecialization(nurseDTO.getSpecialization());
        
        return convertToDTO(nurseRepository.save(nurse));
    }
    
    @Transactional
    public NurseDTO updateNurse(Long id, NurseDTO nurseDTO) {
        // Intentar buscar por nurseId primero, si no existe, buscar por userId
        Nurse nurse = nurseRepository.findById(id)
            .orElseGet(() -> nurseRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Enfermero no encontrado con ID: " + id)));

        nurse.setLicenseNumber(nurseDTO.getLicenseNumber());
        nurse.setSpecialization(nurseDTO.getSpecialization());
        
        // Actualizar islas si se proporcionan
        if (nurseDTO.getAssignedIslands() != null && !nurseDTO.getAssignedIslands().isEmpty()) {
            List<Island> islands = islandRepository.findAllById(
                nurseDTO.getAssignedIslands().stream().map(IslandDTO::getId).collect(java.util.stream.Collectors.toList())
            );
            nurse.setAssignedIslands(islands);
        }
        
        // Actualizar camas si se proporcionan
        if (nurseDTO.getAssignedBeds() != null && !nurseDTO.getAssignedBeds().isEmpty()) {
            List<Bed> beds = bedRepository.findAllById(
                nurseDTO.getAssignedBeds().stream().map(com.hospital.dto.BedDTO::getId).collect(java.util.stream.Collectors.toList())
            );
            nurse.setAssignedBeds(beds);
        }
        
        return convertToDTO(nurseRepository.save(nurse));
    }
    
    @Transactional
    public NurseDTO assignIslandsAndBedsToNurse(Long id, List<Long> islandIds, List<Long> bedIds) {
        // Intentar buscar por nurseId primero, si no existe, buscar por userId
        Nurse nurse = nurseRepository.findById(id)
            .orElseGet(() -> nurseRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Enfermero no encontrado con ID: " + id)));

        if (islandIds != null) {
            List<Island> islands = islandRepository.findAllById(islandIds);
            nurse.setAssignedIslands(islands);
        }

        if (bedIds != null) {
            List<Bed> beds = bedRepository.findAllById(bedIds);
            nurse.setAssignedBeds(beds);
        }

        return convertToDTO(nurseRepository.save(nurse));
    }

    // Obtener camas asignadas a un enfermero
    public List<com.hospital.dto.BedDTO> getBedsAssignedToNurse(Long id) {
        // Intentar buscar por nurseId primero, si no existe, buscar por userId
        Nurse nurse = nurseRepository.findById(id)
            .orElseGet(() -> nurseRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Enfermero no encontrado con ID: " + id)));

        return nurse.getAssignedBeds().stream()
            .map(bed -> {
                com.hospital.dto.BedDTO b = new com.hospital.dto.BedDTO();
                b.setId(bed.getId());
                b.setBedNumber(bed.getBedNumber());
                b.setIslandId(bed.getIsland() != null ? bed.getIsland().getId() : null);
                b.setIslandName(bed.getIsland() != null ? bed.getIsland().getName() : null);
                b.setQrCode(bed.getQrCode());
                b.setOccupied(bed.getPatient() != null);
                return b;
            })
            .collect(Collectors.toList());
    }

    // Obtener pacientes asignados a un enfermero (a través de sus camas)
    public List<com.hospital.dto.PatientDTO> getPatientsAssignedToNurse(Long id) {
        // Intentar buscar por nurseId primero, si no existe, buscar por userId
        Nurse nurse = nurseRepository.findById(id)
            .orElseGet(() -> nurseRepository.findByUserId(id)
                .orElseThrow(() -> new RuntimeException("Enfermero no encontrado con ID: " + id)));

        return nurse.getAssignedBeds().stream()
            .filter(bed -> bed.getPatient() != null)
            .map(bed -> {
                com.hospital.dto.PatientDTO dto = new com.hospital.dto.PatientDTO();
                Patient patient = bed.getPatient();
                dto.setId(patient.getId());
                dto.setUserId(patient.getUser().getId());
                dto.setUsername(patient.getUser().getUsername());
                dto.setFullName(patient.getUser().getFullName());
                dto.setEmail(patient.getUser().getEmail());
                dto.setDiagnosis(patient.getDiagnosis());
                dto.setTreatment(patient.getTreatment());
                dto.setAdmissionDate(patient.getAdmissionDate());
                dto.setDischargeDate(patient.getDischargeDate());
                dto.setMedicalRecordNumber(patient.getMedicalRecordNumber());
                if (patient.getBed() != null) {
                    dto.setBedId(patient.getBed().getId());
                    dto.setBedNumber(patient.getBed().getBedNumber());
                }
                return dto;
            })
            .collect(Collectors.toList());
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
        
        // map assigned beds
        java.util.List<com.hospital.dto.BedDTO> bedDTOs = nurse.getAssignedBeds().stream()
            .map(bed -> {
                com.hospital.dto.BedDTO b = new com.hospital.dto.BedDTO();
                b.setId(bed.getId());
                b.setBedNumber(bed.getBedNumber());
                b.setIslandId(bed.getIsland() != null ? bed.getIsland().getId() : null);
                b.setIslandName(bed.getIsland() != null ? bed.getIsland().getName() : null);
                b.setQrCode(bed.getQrCode());
                b.setOccupied(bed.getPatient() != null);
                return b;
            })
            .collect(Collectors.toList());
        dto.setAssignedBeds(bedDTOs);
        
        return dto;
    }
}

