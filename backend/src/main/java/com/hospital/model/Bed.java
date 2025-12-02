package com.hospital.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "beds")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}

