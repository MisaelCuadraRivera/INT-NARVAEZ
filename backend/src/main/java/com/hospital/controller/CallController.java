package com.hospital.controller;

import com.hospital.model.Call;
import com.hospital.service.CallService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calls")
@CrossOrigin(origins = "*")
public class CallController {

    @Autowired
    private CallService callService;

    // Public endpoint: patient can create a call by bedId
    @PostMapping
    public ResponseEntity<?> createCall(@RequestBody Map<String, Object> body) {
        try {
            Number bedIdNum = (Number) body.get("bedId");
            if (bedIdNum == null) {
                return ResponseEntity.badRequest().body("bedId es requerido") ;
            }
            Long bedId = bedIdNum.longValue();
            Call call = callService.createCall(bedId);
            Map<String, Object> resp = new HashMap<>();
            resp.put("id", call.getId());
            resp.put("status", call.getStatus());
            resp.put("createdAt", call.getCreatedAt());
            return ResponseEntity.ok(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/nurse/{nurseId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_NURSE')")
    public ResponseEntity<List<Call>> getCallsForNurse(@PathVariable Long nurseId) {
        return ResponseEntity.ok(callService.getActiveCallsForNurse(nurseId));
    }

    @GetMapping("/stream/{nurseId}")
    public SseEmitter streamCalls(@PathVariable Long nurseId) {
        return callService.subscribe(nurseId);
    }

    @PostMapping("/{id}/ack")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_NURSE')")
    public ResponseEntity<?> ack(@PathVariable Long id) {
        try {
            Call c = callService.acknowledgeCall(id);
            return ResponseEntity.ok(c);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
