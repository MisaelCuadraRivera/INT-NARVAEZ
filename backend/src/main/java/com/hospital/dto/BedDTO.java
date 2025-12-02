package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BedDTO {
    private Long id;
    private String bedNumber;
    private Long islandId;
    private String islandName;
    private PatientDTO patient;
    private String qrCode;
    private String qrCodeUrl;
    private boolean occupied;
}

