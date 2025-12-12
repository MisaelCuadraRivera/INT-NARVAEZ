package com.hospital.dto;

import java.util.List;

public class NurseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String licenseNumber;
    private String specialization;
    private List<IslandDTO> assignedIslands;
    private java.util.List<BedDTO> assignedBeds;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public List<IslandDTO> getAssignedIslands() {
        return assignedIslands;
    }

    public void setAssignedIslands(List<IslandDTO> assignedIslands) {
        this.assignedIslands = assignedIslands;
    }

    public java.util.List<BedDTO> getAssignedBeds() {
        return assignedBeds;
    }

    public void setAssignedBeds(java.util.List<BedDTO> assignedBeds) {
        this.assignedBeds = assignedBeds;
    }
}



