package com.hospital.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore; // <--- IMPORTANTE

@Entity
@Table(name = "nurses")
public class Nurse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mantenemos el usuario visible para saber su nombre, pero con cuidado
    // Si User ya tiene @JsonIgnore en 'nurse', esto no debería dar problemas.
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // --- AQUÍ CORTAMOS EL BUCLE ---
    // Al poner @JsonIgnore, el JSON del enfermero NO incluirá la lista gigante de islas
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "nurse_islands",
            joinColumns = @JoinColumn(name = "nurse_id"),
            inverseJoinColumns = @JoinColumn(name = "island_id")
    )
    private List<Island> assignedIslands = new ArrayList<>();

    // --- AQUÍ CORTAMOS EL OTRO BUCLE ---
    // Al poner @JsonIgnore, no incluirá las camas, evitando que se meta en las llamadas de esas camas
    @JsonIgnore
    @ManyToMany
    @JoinTable(
            name = "nurse_beds",
            joinColumns = @JoinColumn(name = "nurse_id"),
            inverseJoinColumns = @JoinColumn(name = "bed_id")
    )
    private List<Bed> assignedBeds = new ArrayList<>();

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

    public List<Bed> getAssignedBeds() {
        return assignedBeds;
    }

    public void setAssignedBeds(List<Bed> assignedBeds) {
        this.assignedBeds = assignedBeds;
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
