package com.hospital.service;

import com.hospital.dto.PatientDTO;
import com.hospital.model.*;
import com.hospital.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {
    
    @Autowired
    private PatientRepository patientRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BedRepository bedRepository;
    
    @Autowired
    private QRCodeService qrCodeService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public List<PatientDTO> getAllPatients() {
        return patientRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        return convertToDTO(patient);
    }
    
    @Transactional
    public PatientDTO createPatient(PatientDTO patientDTO) {
        try {
            User user;
            
            // Si se proporciona userId, usar ese usuario existente
            if (patientDTO.getUserId() != null) {
                user = userRepository.findById(patientDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + patientDTO.getUserId()));
                
                // Si el usuario no es paciente, lo convertimos a paciente
                if (user.getRole() != Role.PATIENT) {
                    user.setRole(Role.PATIENT);
                    userRepository.save(user);
                }
            } 
            // Si no hay userId pero hay datos de usuario, crear el usuario automáticamente
            else if (patientDTO.getUsername() != null && !patientDTO.getUsername().trim().isEmpty()) {
                // Validar que el username no exista
                if (userRepository.existsByUsername(patientDTO.getUsername())) {
                    throw new RuntimeException("El nombre de usuario ya existe: " + patientDTO.getUsername());
                }
                
                // Validar email si se proporciona
                if (patientDTO.getEmail() != null && !patientDTO.getEmail().trim().isEmpty()) {
                    if (userRepository.existsByEmail(patientDTO.getEmail())) {
                        throw new RuntimeException("El email ya está registrado: " + patientDTO.getEmail());
                    }
                }
                
                // Crear nuevo usuario
                user = new User();
                user.setUsername(patientDTO.getUsername());
                user.setFullName(patientDTO.getFullName() != null ? patientDTO.getFullName() : patientDTO.getUsername());
                user.setEmail(patientDTO.getEmail() != null ? patientDTO.getEmail() : patientDTO.getUsername() + "@hospital.com");
                user.setPassword(passwordEncoder.encode(patientDTO.getPassword() != null ? patientDTO.getPassword() : "paciente123"));
                user.setRole(Role.PATIENT);
                user = userRepository.save(user);
            } else {
                throw new RuntimeException("Debe proporcionar un ID de usuario existente o los datos para crear un nuevo usuario (username, fullName, email)");
            }
            
            Patient patient = new Patient();
            patient.setUser(user);
            patient.setDiagnosis(patientDTO.getDiagnosis());
            patient.setTreatment(patientDTO.getTreatment());
            patient.setMedicalRecordNumber(patientDTO.getMedicalRecordNumber());
            patient.setAdmissionDate(LocalDateTime.now());
            
            if (patientDTO.getBedId() != null) {
                Bed bed = bedRepository.findById(patientDTO.getBedId())
                    .orElseThrow(() -> new RuntimeException("Cama no encontrada"));
                
                if (bed.getPatient() != null) {
                    throw new RuntimeException("La cama ya está ocupada");
                }
                
                patient.setBed(bed);
                bed.setPatient(patient);
            }
            
            // Guardar primero el paciente
            Patient savedPatient = patientRepository.save(patient);
            
            // Si hay cama asignada, guardar la cama y generar QR code
            if (savedPatient.getBed() != null) {
                bedRepository.save(savedPatient.getBed());
                try {
                    qrCodeService.generateQRCodeString(savedPatient.getBed());
                } catch (Exception e) {
                    // Log el error pero no fallar la creación del paciente
                    System.err.println("Error al generar QR code: " + e.getMessage());
                }
            }
            
            return convertToDTO(savedPatient);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al crear paciente: " + e.getMessage(), e);
        }
    }
    
    @Transactional
    public PatientDTO updatePatient(Long id, PatientDTO patientDTO) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
        patient.setDiagnosis(patientDTO.getDiagnosis());
        patient.setTreatment(patientDTO.getTreatment());
        patient.setMedicalRecordNumber(patientDTO.getMedicalRecordNumber());
        
        // Cambiar cama si es necesario
        if (patientDTO.getBedId() != null && 
            (patient.getBed() == null || !patient.getBed().getId().equals(patientDTO.getBedId()))) {
            if (patient.getBed() != null) {
                patient.getBed().setPatient(null);
            }
            
            Bed newBed = bedRepository.findById(patientDTO.getBedId())
                .orElseThrow(() -> new RuntimeException("Cama no encontrada"));
            
            if (newBed.getPatient() != null && !newBed.getPatient().getId().equals(id)) {
                throw new RuntimeException("La cama ya está ocupada");
            }
            
            patient.setBed(newBed);
            newBed.setPatient(patient);
        }
        
        Patient savedPatient = patientRepository.save(patient);
        
        // Actualizar QR code
        if (savedPatient.getBed() != null) {
            qrCodeService.generateQRCodeString(savedPatient.getBed());
        }
        
        return convertToDTO(savedPatient);
    }
    
    @Transactional
    public void dischargePatient(Long id) {
        Patient patient = patientRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        
        patient.setDischargeDate(LocalDateTime.now());
        if (patient.getBed() != null) {
            patient.getBed().setPatient(null);
            patient.setBed(null);
        }
        
        patientRepository.save(patient);
    }
    
    private PatientDTO convertToDTO(Patient patient) {
        PatientDTO dto = new PatientDTO();
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
    }
}

