package com.hospital.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NurseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String licenseNumber;
    private String specialization;
    private List<IslandDTO> assignedIslands;
}

