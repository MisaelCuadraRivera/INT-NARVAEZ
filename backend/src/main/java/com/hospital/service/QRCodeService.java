package com.hospital.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.hospital.dto.QRCodeData;
import com.hospital.model.Bed;
import com.hospital.model.Patient;
import com.hospital.model.Nurse;
import com.hospital.repository.BedRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.UUID;

@Service
public class QRCodeService {
    
    @Autowired
    private BedRepository bedRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public String generateQRCodeForBed(Bed bed) throws WriterException, IOException {
        QRCodeData qrData = buildQRCodeData(bed);
        String jsonData = objectMapper.writeValueAsString(qrData);
        
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(jsonData, BarcodeFormat.QR_CODE, 300, 300);
        
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();
        
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
    }
    
    public String generateQRCodeString(Bed bed) {
        String qrCode = UUID.randomUUID().toString();
        bed.setQrCode(qrCode);
        
        try {
            QRCodeData qrData = buildQRCodeData(bed);
            String jsonData = objectMapper.writeValueAsString(qrData);
            bed.setQrCodeData(jsonData);
            bedRepository.save(bed);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar datos del QR", e);
        }
        
        return qrCode;
    }
    
    private QRCodeData buildQRCodeData(Bed bed) {
        QRCodeData qrData = new QRCodeData();
        qrData.setBedId(bed.getId());
        qrData.setBedNumber(bed.getBedNumber());
        qrData.setIslandName(bed.getIsland().getName());
        
        if (bed.getPatient() != null) {
            Patient patient = bed.getPatient();
            QRCodeData.PatientInfo patientInfo = new QRCodeData.PatientInfo(
                patient.getUser().getFullName(),
                patient.getDiagnosis(),
                patient.getTreatment(),
                patient.getMedicalRecordNumber()
            );
            qrData.setPatientInfo(patientInfo);
            
            // Obtener enfermero asignado a la isla
            if (!bed.getIsland().getNurses().isEmpty()) {
                Nurse nurse = bed.getIsland().getNurses().get(0);
                QRCodeData.NurseInfo nurseInfo = new QRCodeData.NurseInfo(
                    nurse.getUser().getFullName(),
                    nurse.getLicenseNumber()
                );
                qrData.setNurseInfo(nurseInfo);
            }
        }
        
        return qrData;
    }
    
    public QRCodeData getQRCodeData(String qrCode) {
        Bed bed = bedRepository.findByQrCode(qrCode)
            .orElseThrow(() -> new RuntimeException("Código QR no encontrado"));
        
        try {
            if (bed.getQrCodeData() != null) {
                return objectMapper.readValue(bed.getQrCodeData(), QRCodeData.class);
            }
            return buildQRCodeData(bed);
        } catch (Exception e) {
            throw new RuntimeException("Error al leer datos del QR", e);
        }
    }
}

