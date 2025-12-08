package com.hospital.config;

import com.hospital.model.Role;
import com.hospital.model.User;
import com.hospital.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
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
            User nurse = new User();
            nurse.setUsername("enfermero");
            nurse.setPassword(passwordEncoder.encode("enfermero123"));
            nurse.setEmail("enfermero@hospital.com");
            nurse.setFullName("Enfermero Ejemplo");
            nurse.setRole(Role.NURSE);
            userRepository.save(nurse);
            System.out.println("Usuario enfermero creado - Usuario: enfermero, Contraseña: enfermero123");
        }
        
        // Crear usuario Paciente si no existe
        if (!userRepository.existsByUsername("paciente")) {
            User patient = new User();
            patient.setUsername("paciente");
            patient.setPassword(passwordEncoder.encode("paciente123"));
            patient.setEmail("paciente@hospital.com");
            patient.setFullName("Paciente Ejemplo");
            patient.setRole(Role.PATIENT);
            userRepository.save(patient);
            System.out.println("Usuario paciente creado - Usuario: paciente, Contraseña: paciente123");
        }
    }
}


