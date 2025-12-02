package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QRCodeData {
    private Long bedId;
    private String bedNumber;
    private String islandName;
    private PatientInfo patientInfo;
    private NurseInfo nurseInfo;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientInfo {
        private String fullName;
        private String diagnosis;
        private String treatment;
        private String medicalRecordNumber;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NurseInfo {
        private String fullName;
        private String licenseNumber;
    }
}

