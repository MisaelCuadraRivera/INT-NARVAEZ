package com.hospital.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.BedDTO;
import com.hospital.dto.NurseDTO;
import com.hospital.dto.PatientDTO;
import com.hospital.service.NurseService;

@RestController
@RequestMapping("/api/nurses")
@CrossOrigin(origins = "*")
public class NurseController {
    
    @Autowired
    private NurseService nurseService;
    
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_NURSE')")
    public ResponseEntity<List<NurseDTO>> getAllNurses() {
        return ResponseEntity.ok(nurseService.getAllNurses());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_NURSE')")
    public ResponseEntity<NurseDTO> getNurseById(@PathVariable Long id) {
        return ResponseEntity.ok(nurseService.getNurseById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<NurseDTO> createNurse(@RequestBody NurseDTO nurseDTO) {
        return ResponseEntity.ok(nurseService.createNurse(nurseDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_NURSE')")
    public ResponseEntity<NurseDTO> updateNurse(@PathVariable Long id, @RequestBody NurseDTO nurseDTO) {
        return ResponseEntity.ok(nurseService.updateNurse(id, nurseDTO));
    }
    
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<NurseDTO> assignIslandsAndBeds(@PathVariable Long id, @RequestBody com.hospital.dto.AssignRequest request) {
        return ResponseEntity.ok(nurseService.assignIslandsAndBedsToNurse(id, request.getIslandIds(), request.getBedIds()));
    }

    @GetMapping("/{id}/beds")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_NURSE')")
    public ResponseEntity<List<BedDTO>> getBedsAssignedToNurse(@PathVariable Long id) {
        return ResponseEntity.ok(nurseService.getBedsAssignedToNurse(id));
    }

    @GetMapping("/{id}/patients")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_NURSE')")
    public ResponseEntity<List<PatientDTO>> getPatientsAssignedToNurse(@PathVariable Long id) {
        return ResponseEntity.ok(nurseService.getPatientsAssignedToNurse(id));
    }
}


