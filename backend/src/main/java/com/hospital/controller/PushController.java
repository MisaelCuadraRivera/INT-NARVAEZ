package com.hospital.controller;

import com.hospital.model.PushSubscription;
import com.hospital.service.PushService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
@CrossOrigin(origins = "*")
public class PushController {

    @Autowired
    private PushService pushService;

    @GetMapping("/vapidPublicKey")
    public ResponseEntity<?> getVapidPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", pushService.getPublicKey()));
    }

    @PostMapping("/subscribe/{nurseId}")
    public ResponseEntity<?> subscribe(@PathVariable Long nurseId, @RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> sub = (Map<String, Object>) body.get("subscription");
            String endpoint = (String) sub.get("endpoint");
            Map<String, String> keys = (Map<String, String>) sub.get("keys");
            String p256dh = keys.get("p256dh");
            String auth = keys.get("auth");

            PushSubscription ps = new PushSubscription();
            ps.setEndpoint(endpoint);
            ps.setP256dh(p256dh);
            ps.setAuth(auth);
            PushSubscription saved = pushService.saveSubscription(nurseId, ps);
            return ResponseEntity.ok(Map.of("id", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
