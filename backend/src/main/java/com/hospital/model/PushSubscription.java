package com.hospital.model;

import jakarta.persistence.*;

@Entity
@Table(name = "push_subscriptions")
public class PushSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "nurse_id")
    private Nurse nurse;

    @Column(columnDefinition = "text")
    private String endpoint;

    @Column(name = "p256dh")
    private String p256dh;

    @Column(name = "auth_key")
    private String auth;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Nurse getNurse() { return nurse; }
    public void setNurse(Nurse nurse) { this.nurse = nurse; }

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getP256dh() { return p256dh; }
    public void setP256dh(String p256dh) { this.p256dh = p256dh; }

    public String getAuth() { return auth; }
    public void setAuth(String auth) { this.auth = auth; }
}
