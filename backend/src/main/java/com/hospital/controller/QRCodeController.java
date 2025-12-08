package com.hospital.controller;

import com.hospital.dto.QRCodeData;
import com.hospital.model.Bed;
import com.hospital.repository.BedRepository;
import com.hospital.service.QRCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@CrossOrigin(origins = "*")
public class QRCodeController {
    
    @Autowired
    private QRCodeService qrCodeService;
    
    @Autowired
    private BedRepository bedRepository;
    
    @GetMapping("/bed/{bedId}")
    public ResponseEntity<String> getQRCodeImage(@PathVariable Long bedId) {
        try {
            Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new RuntimeException("Cama no encontrada"));
            String qrImage = qrCodeService.generateQRCodeForBed(bed);
            return ResponseEntity.ok(qrImage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al generar QR: " + e.getMessage());
        }
    }
    
    @GetMapping("/data/{qrCode}")
    public ResponseEntity<QRCodeData> getQRCodeData(@PathVariable String qrCode) {
        try {
            QRCodeData data = qrCodeService.getQRCodeData(qrCode);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}


