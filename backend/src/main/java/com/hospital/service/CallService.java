package com.hospital.service;

import com.hospital.model.Call;
import com.hospital.model.Bed;
import com.hospital.model.Nurse;
import com.hospital.model.Patient;
import com.hospital.repository.BedRepository;
import com.hospital.repository.CallRepository;
import com.hospital.repository.NurseRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CallService {

    @Autowired
    private CallRepository callRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private NurseRepository nurseRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private com.hospital.service.PushService pushService;

    private static final int COOLDOWN_SECONDS = 30;
    private static final int EXPIRE_MINUTES = 10;
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    // Método auxiliar para encontrar al enfermero de forma robusta
    // (Busca por User ID primero, y si falla, por Nurse ID)
    private Optional<Nurse> resolveNurse(Long userIdOrNurseId) {
        Optional<Nurse> nurseOpt = nurseRepository.findByUserId(userIdOrNurseId);
        if (nurseOpt.isEmpty()) {
            nurseOpt = nurseRepository.findById(userIdOrNurseId);
        }
        return nurseOpt;
    }

    @Transactional
    public Call createCall(Long bedId) {
        Bed bed = bedRepository.findById(bedId)
                .orElseThrow(() -> new RuntimeException("Cama no encontrada"));

        // cooldown: check recent active calls for this bed
        List<Call> recent = callRepository.findByBedIdAndStatusOrderByCreatedAtDesc(bedId, "ACTIVE");
        if (recent != null && !recent.isEmpty()) {
            Call last = recent.get(0);
            if (last.getCreatedAt() != null && last.getCreatedAt().isAfter(LocalDateTime.now().minusSeconds(COOLDOWN_SECONDS))) {
                throw new RuntimeException("Llamado ya realizado recientemente. Intenta de nuevo más tarde.");
            }
        }

        // find nurse responsible for this bed
        Nurse assigned = null;
        List<Nurse> nurses = nurseRepository.findAll();
        for (Nurse n : nurses) {
            if (n.getAssignedBeds() != null) {
                for (Bed b : n.getAssignedBeds()) {
                    if (b.getId().equals(bedId)) {
                        assigned = n;
                        break;
                    }
                }
            }
            if (assigned != null) break;
            if (assigned == null && n.getAssignedIslands() != null && bed.getIsland() != null) {
                for (var isl : n.getAssignedIslands()) {
                    if (bed.getIsland() != null && isl.getId().equals(bed.getIsland().getId())) {
                        assigned = n;
                        break;
                    }
                }
            }
            if (assigned != null) break;
        }

        // fallback: try to use island's first nurse if present
        if (assigned == null && bed.getIsland() != null && bed.getIsland().getNurses() != null && !bed.getIsland().getNurses().isEmpty()) {
            assigned = bed.getIsland().getNurses().get(0);
        }

        if (assigned == null) {
            throw new RuntimeException("No se encontró enfermero asignado a esta cama");
        }

        Patient patient = bed.getPatient();

        Call call = new Call();
        call.setBed(bed);
        call.setPatient(patient);
        call.setNurse(assigned);
        call.setStatus("ACTIVE");
        call.setCreatedAt(LocalDateTime.now());
        call.setExpiresAt(LocalDateTime.now().plusMinutes(EXPIRE_MINUTES));

        Call saved = callRepository.save(call);

        // notify via SSE if nurse is connected
        if (assigned != null) {
            // Importante: Usamos el ID real del enfermero para buscar el emisor
            SseEmitter emitter = emitters.get(assigned.getId());
            if (emitter != null) {
                try {
                    emitter.send(saved);
                } catch (IOException e) {
                    emitters.remove(assigned.getId());
                }
            }

            // send web-push notifications to nurse subscriptions
            try {
                String bedNum = bed.getBedNumber() != null ? bed.getBedNumber() : String.valueOf(bed.getId());
                String patientName = patient != null && patient.getUser() != null ? patient.getUser().getFullName() : "Paciente";
                String title = "Llamado de emergencia";
                String bodyText = String.format("%s en cama %s está llamando.", patientName, bedNum);
                pushService.sendPushToNurse(assigned.getId(), title, bodyText);
            } catch (Exception e) {
                System.err.println("Error sending push notifications: " + e.getMessage());
            }
        }

        return saved;
    }

    // MODIFICADO: Ahora es inteligente para buscar por UserID o NurseID
    public List<Call> getActiveCallsForNurse(Long userIdOrNurseId) {
        Optional<Nurse> nurseOpt = resolveNurse(userIdOrNurseId);

        if (nurseOpt.isPresent()) {
            return callRepository.findByNurseIdAndStatusOrderByCreatedAtDesc(nurseOpt.get().getId(), "ACTIVE");
        }

        return new ArrayList<>();
    }

    // MODIFICADO: Registra el SSE bajo el ID real del enfermero
    public SseEmitter subscribe(Long userIdOrNurseId) {
        // Resolvemos quién es el enfermero real detrás de este ID
        Optional<Nurse> nurseOpt = resolveNurse(userIdOrNurseId);
        Long realNurseId = nurseOpt.map(Nurse::getId).orElse(userIdOrNurseId);

        SseEmitter emitter = new SseEmitter(0L); // 0L significa timeout infinito

        // Guardamos el emisor usando el ID REAL del enfermero
        emitters.put(realNurseId, emitter);

        emitter.onCompletion(() -> emitters.remove(realNurseId));
        emitter.onTimeout(() -> emitters.remove(realNurseId));
        emitter.onError((e) -> emitters.remove(realNurseId));

        return emitter;
    }

    @Transactional
    public Call acknowledgeCall(Long callId) {
        Call call = callRepository.findById(callId).orElseThrow(() -> new RuntimeException("Llamado no encontrado"));
        call.setStatus("ACKNOWLEDGED");
        return callRepository.save(call);
    }
}