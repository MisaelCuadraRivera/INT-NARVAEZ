package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private Long bedId;
    private String bedNumber;
    private String diagnosis;
    private String treatment;
    private LocalDateTime admissionDate;
    private LocalDateTime dischargeDate;
    private String medicalRecordNumber;
}

