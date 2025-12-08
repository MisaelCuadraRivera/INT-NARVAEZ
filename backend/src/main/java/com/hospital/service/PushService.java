package com.hospital.service;

import com.hospital.model.PushSubscription;
import com.hospital.model.Nurse;
import com.hospital.repository.PushSubscriptionRepository;
import com.hospital.repository.NurseRepository;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.Utils;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Security;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class PushService {

    @Autowired
    private PushSubscriptionRepository pushRepo;

    @Autowired
    private NurseRepository nurseRepository;

    private String publicKey;
    private String privateKey;
    private nl.martijndwars.webpush.PushService webPushService;

    @PostConstruct
    public void init() throws Exception {
        Security.addProvider(new BouncyCastleProvider());
        // TODO: Configurar VAPID keys para notificaciones push
        // Por ahora, las notificaciones push están deshabilitadas
        System.out.println("Push notification service initialized (keys not configured)");
    }

    public String getPublicKey() {
        return publicKey;
    }

    public PushSubscription saveSubscription(Long nurseId, PushSubscription sub) {
        Nurse nurse = nurseRepository.findById(nurseId).orElse(null);
        sub.setNurse(nurse);
        return pushRepo.save(sub);
    }

    public List<PushSubscription> getSubscriptionsForNurse(Long nurseId) {
        return pushRepo.findByNurseId(nurseId);
    }

    public void sendPushToNurse(Long nurseId, String title, String body) {
        // TODO: Implementar envío de notificaciones push cuando se configuren las keys
        System.out.println("Push notification requested for nurse " + nurseId + ": " + title + " - " + body);
    }
}
