package com.hospital.service;

import com.hospital.dto.PatientDTO;
import com.hospital.model.*;
import com.hospital.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
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
        User user = userRepository.findById(patientDTO.getUserId())
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Validación flexible: si el usuario no es paciente, lo convertimos a paciente
        // (caso típico: el admin crea primero el usuario y luego el paciente desde el dashboard)
        if (user.getRole() != Role.PATIENT) {
            user.setRole(Role.PATIENT);
            userRepository.save(user);
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
        
        Patient savedPatient = patientRepository.save(patient);
        
        // Actualizar QR code si hay cama asignada
        if (savedPatient.getBed() != null) {
            qrCodeService.generateQRCodeString(savedPatient.getBed());
        }
        
        return convertToDTO(savedPatient);
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

