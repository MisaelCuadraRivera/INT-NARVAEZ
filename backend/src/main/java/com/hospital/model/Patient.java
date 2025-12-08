package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @OneToOne
    @JoinColumn(name = "bed_id", unique = true)
    private Bed bed;
    
    @Column(length = 1000)
    private String diagnosis;
    
    @Column(length = 2000)
    private String treatment;
    
    @Column
    private LocalDateTime admissionDate;
    
    @Column
    private LocalDateTime dischargeDate;
    
    @Column
    private String medicalRecordNumber;
}


