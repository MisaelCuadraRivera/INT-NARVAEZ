package com.hospital.model;

import jakarta.persistence.*;

@Entity
@Table(name = "beds")
public class Bed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String bedNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "island_id", nullable = false)
    private Island island;
    
    @OneToOne(mappedBy = "bed", cascade = CascadeType.ALL)
    private Patient patient;
    
    @Column(unique = true)
    private String qrCode;
    
    @Column(columnDefinition = "TEXT")
    private String qrCodeData;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public void setBedNumber(String bedNumber) {
        this.bedNumber = bedNumber;
    }

    public Island getIsland() {
        return island;
    }

    public void setIsland(Island island) {
        this.island = island;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }
}


