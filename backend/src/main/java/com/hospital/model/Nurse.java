package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nurses")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}


