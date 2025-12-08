package com.hospital.controller;

import com.hospital.dto.BedDTO;
import com.hospital.dto.IslandDTO;
import com.hospital.service.IslandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/islands")
@CrossOrigin(origins = "*")
public class IslandController {
    
    @Autowired
    private IslandService islandService;
    
    @GetMapping
    public ResponseEntity<List<IslandDTO>> getAllIslands() {
        return ResponseEntity.ok(islandService.getAllIslands());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<IslandDTO> getIslandById(@PathVariable Long id) {
        return ResponseEntity.ok(islandService.getIslandById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IslandDTO> createIsland(@RequestBody IslandDTO islandDTO) {
        return ResponseEntity.ok(islandService.createIsland(islandDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<IslandDTO> updateIsland(@PathVariable Long id, @RequestBody IslandDTO islandDTO) {
        return ResponseEntity.ok(islandService.updateIsland(id, islandDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIsland(@PathVariable Long id) {
        islandService.deleteIsland(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/{islandId}/beds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BedDTO> addBedToIsland(@PathVariable Long islandId, @RequestBody BedDTO bedDTO) {
        return ResponseEntity.ok(islandService.addBedToIsland(islandId, bedDTO));
    }
}


