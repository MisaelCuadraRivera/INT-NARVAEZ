package com.hospital.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- IMPORTANTE

@Entity
@Table(name = "beds")
public class Bed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bedNumber;

    // Mantenemos Island visible (sin JsonIgnore) porque es útil saber de qué isla es la cama.
    // Como Island.java ya tiene @JsonIgnore en 'beds', el bucle se rompe allá.
    @ManyToOne(fetch = FetchType.EAGER) // Cambiado a EAGER para evitar errores de sesión cerrada
    @JoinColumn(name = "island_id", nullable = false)
    private Island island;

    // --- CORTAR BUCLE: La cama no necesita pintar al paciente en el JSON ---
    // (El objeto 'Call' ya tiene al paciente directo)
    @JsonIgnore
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