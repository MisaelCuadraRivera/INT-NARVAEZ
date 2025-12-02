package com.hospital.controller;

import com.hospital.dto.NurseDTO;
import com.hospital.service.NurseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nurses")
@CrossOrigin(origins = "*")
public class NurseController {
    
    @Autowired
    private NurseService nurseService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    public ResponseEntity<List<NurseDTO>> getAllNurses() {
        return ResponseEntity.ok(nurseService.getAllNurses());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    public ResponseEntity<NurseDTO> getNurseById(@PathVariable Long id) {
        return ResponseEntity.ok(nurseService.getNurseById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NurseDTO> createNurse(@RequestBody NurseDTO nurseDTO) {
        return ResponseEntity.ok(nurseService.createNurse(nurseDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'NURSE')")
    public ResponseEntity<NurseDTO> updateNurse(@PathVariable Long id, @RequestBody NurseDTO nurseDTO) {
        return ResponseEntity.ok(nurseService.updateNurse(id, nurseDTO));
    }
    
    @PostMapping("/{id}/assign-islands")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NurseDTO> assignIslands(@PathVariable Long id, @RequestBody List<Long> islandIds) {
        return ResponseEntity.ok(nurseService.assignIslandsToNurse(id, islandIds));
    }
}

