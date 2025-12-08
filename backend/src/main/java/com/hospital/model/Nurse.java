package com.hospital.model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nurses")
public class Nurse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @ManyToMany
    @JoinTable(
        name = "nurse_islands",
        joinColumns = @JoinColumn(name = "nurse_id"),
        inverseJoinColumns = @JoinColumn(name = "island_id")
    )
    private List<Island> assignedIslands = new ArrayList<>();
    
    @Column
    private String licenseNumber;
    
    @Column
    private String specialization;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<Island> getAssignedIslands() {
        return assignedIslands;
    }

    public void setAssignedIslands(List<Island> assignedIslands) {
        this.assignedIslands = assignedIslands;
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
}


