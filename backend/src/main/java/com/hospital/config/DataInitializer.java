package com.hospital.config;

import com.hospital.model.Nurse;
import com.hospital.model.Patient;
import com.hospital.model.Role;
import com.hospital.model.User;
import com.hospital.repository.NurseRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Crear usuario Admin si no existe
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@hospital.com");
            admin.setFullName("Administrador del Sistema");
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Usuario admin creado - Usuario: admin, Contraseña: admin123");
        }
        
        // Crear usuario Enfermero si no existe
        if (!userRepository.existsByUsername("enfermero")) {
            User nurseUser = new User();
            nurseUser.setUsername("enfermero");
            nurseUser.setPassword(passwordEncoder.encode("enfermero123"));
            nurseUser.setEmail("enfermero@hospital.com");
            nurseUser.setFullName("Enfermero Ejemplo");
            nurseUser.setRole(Role.NURSE);
            nurseUser = userRepository.save(nurseUser);

            // Crear registro de enfermero
            Nurse nurse = new Nurse();
            nurse.setUser(nurseUser);
            nurse.setLicenseNumber("ENF-001");
            nurse.setSpecialization("Cuidados Generales");
            nurseRepository.save(nurse);

            System.out.println("Usuario enfermero creado - Usuario: enfermero, Contraseña: enfermero123");
        }
        
        // Crear usuario Paciente si no existe
        if (!userRepository.existsByUsername("paciente")) {
            User patientUser = new User();
            patientUser.setUsername("paciente");
            patientUser.setPassword(passwordEncoder.encode("paciente123"));
            patientUser.setEmail("paciente@hospital.com");
            patientUser.setFullName("Paciente Ejemplo");
            patientUser.setRole(Role.PATIENT);
            patientUser = userRepository.save(patientUser);

            // Crear registro de paciente
            Patient patient = new Patient();
            patient.setUser(patientUser);
            patient.setMedicalRecordNumber("PAC-001");
            patient.setDiagnosis("Consulta general");
            patient.setAdmissionDate(LocalDateTime.now());
            patientRepository.save(patient);

            System.out.println("Usuario paciente creado - Usuario: paciente, Contraseña: paciente123");
        }
    }
}


