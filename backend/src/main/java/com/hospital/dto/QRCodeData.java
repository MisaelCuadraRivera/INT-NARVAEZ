package com.hospital.dto;

public class QRCodeData {
    private String qrCode;
    private Long bedId;
    private String bedNumber;
    private String islandName;
    private PatientInfo patientInfo;
    private NurseInfo nurseInfo;

    // Getters and Setters
    public Long getBedId() {
        return bedId;
    }

    public void setBedId(Long bedId) {
        this.bedId = bedId;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public String getIslandName() {
        return islandName;
    }

    public void setIslandName(String islandName) {
        this.islandName = islandName;
    }

    public PatientInfo getPatientInfo() {
        return patientInfo;
    }

    public void setPatientInfo(PatientInfo patientInfo) {
        this.patientInfo = patientInfo;
    }

    public NurseInfo getNurseInfo() {
        return nurseInfo;
    }

    public void setNurseInfo(NurseInfo nurseInfo) {
        this.nurseInfo = nurseInfo;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public static class PatientInfo {
        private String fullName;
        private String diagnosis;
        private String treatment;
        private String medicalRecordNumber;

        // Constructors
        public PatientInfo() {
        }

        public PatientInfo(String fullName, String diagnosis, String treatment, String medicalRecordNumber) {
            this.fullName = fullName;
            this.diagnosis = diagnosis;
            this.treatment = treatment;
            this.medicalRecordNumber = medicalRecordNumber;
        }

        // Getters and Setters
        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getDiagnosis() {
            return diagnosis;
        }

        public void setDiagnosis(String diagnosis) {
            this.diagnosis = diagnosis;
        }

        public String getTreatment() {
            return treatment;
        }

        public void setTreatment(String treatment) {
            this.treatment = treatment;
        }

        public String getMedicalRecordNumber() {
            return medicalRecordNumber;
        }

        public void setMedicalRecordNumber(String medicalRecordNumber) {
            this.medicalRecordNumber = medicalRecordNumber;
        }
    }


    public static class NurseInfo {
        private String fullName;
        private String licenseNumber;

        // Constructors
        public NurseInfo() {
        }

        public NurseInfo(String fullName, String licenseNumber) {
            this.fullName = fullName;
            this.licenseNumber = licenseNumber;
        }

        // Getters and Setters
        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getLicenseNumber() {
            return licenseNumber;
        }

        public void setLicenseNumber(String licenseNumber) {
            this.licenseNumber = licenseNumber;
        }
    }
}

