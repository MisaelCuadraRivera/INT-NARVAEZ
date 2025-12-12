package com.hospital.service;

import com.hospital.dto.BedDTO;
import com.hospital.dto.IslandDTO;
import com.hospital.model.Bed;
import com.hospital.model.Island;
import com.hospital.repository.BedRepository;
import com.hospital.repository.IslandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class IslandService {
    
    @Autowired
    private IslandRepository islandRepository;
    
    @Autowired
    private BedRepository bedRepository;
    
    @Autowired
    private QRCodeService qrCodeService;
    
    public List<IslandDTO> getAllIslands() {
        return islandRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public IslandDTO getIslandById(Long id) {
        Island island = islandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Isla no encontrada"));
        return convertToDTO(island);
    }
    
    @Transactional
    public IslandDTO createIsland(IslandDTO islandDTO) {
        if (islandRepository.existsByName(islandDTO.getName())) {
            throw new RuntimeException("Ya existe una isla con ese nombre");
        }
        
        Island island = new Island();
        island.setName(islandDTO.getName());
        island.setDescription(islandDTO.getDescription());
        
        Island savedIsland = islandRepository.save(island);
        return convertToDTO(savedIsland);
    }
    
    @Transactional
    public IslandDTO updateIsland(Long id, IslandDTO islandDTO) {
        Island island = islandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Isla no encontrada"));
        
        if (!island.getName().equals(islandDTO.getName()) && 
            islandRepository.existsByName(islandDTO.getName())) {
            throw new RuntimeException("Ya existe una isla con ese nombre");
        }
        
        island.setName(islandDTO.getName());
        island.setDescription(islandDTO.getDescription());
        
        return convertToDTO(islandRepository.save(island));
    }
    
    @Transactional
    public void deleteIsland(Long id) {
        Island island = islandRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Isla no encontrada"));
        islandRepository.delete(island);
    }
    
    @Transactional
    public BedDTO addBedToIsland(Long islandId, BedDTO bedDTO) {
        Island island = islandRepository.findById(islandId)
            .orElseThrow(() -> new RuntimeException("Isla no encontrada"));
        
        if (bedRepository.findByBedNumberAndIsland(bedDTO.getBedNumber(), island).isPresent()) {
            throw new RuntimeException("Ya existe una cama con ese número en esta isla");
        }
        
        Bed bed = new Bed();
        bed.setBedNumber(bedDTO.getBedNumber());
        bed.setIsland(island);
        
        Bed savedBed = bedRepository.save(bed);
        
        // Generar QR code
        qrCodeService.generateQRCodeString(savedBed);
        
        return convertBedToDTO(savedBed);
    }
    
    private IslandDTO convertToDTO(Island island) {
        IslandDTO dto = new IslandDTO();
        dto.setId(island.getId());
        dto.setName(island.getName());
        dto.setDescription(island.getDescription());
        
        List<BedDTO> beds = island.getBeds().stream()
            .map(this::convertBedToDTO)
            .collect(Collectors.toList());
        dto.setBeds(beds);
        dto.setTotalBeds(beds.size());
        dto.setOccupiedBeds((int) beds.stream().filter(BedDTO::isOccupied).count());
        
        return dto;
    }
    
    private BedDTO convertBedToDTO(Bed bed) {
        BedDTO dto = new BedDTO();
        dto.setId(bed.getId());
        dto.setBedNumber(bed.getBedNumber());
        dto.setIslandId(bed.getIsland().getId());
        dto.setIslandName(bed.getIsland().getName());
        dto.setQrCode(bed.getQrCode());
        dto.setOccupied(bed.getPatient() != null);
        
        if (bed.getPatient() != null) {
            // Se puede agregar información del paciente si es necesario
        }
        
        return dto;
    }
}



