package com.phishingdetector.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scan_results")
public class ScanResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User user;

    @Column(nullable = false, length = 2083)
    private String url;

    private Double riskScore;
    private String classification; // SAFE, PHISHING, SUSPICIOUS

    @Column(columnDefinition = "TEXT")
    private String analysisDetails; // JSON string or detailed markers

    private LocalDateTime createdAt;

    public ScanResult() {}

    public ScanResult(User user, String url, Double riskScore, String classification) {
        this.user = user;
        this.url = url;
        this.riskScore = riskScore;
        this.classification = classification;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static ScanResultBuilder builder() {
        return new ScanResultBuilder();
    }

    public static class ScanResultBuilder {
        private ScanResult result = new ScanResult();
        public ScanResultBuilder user(User val) { result.user = val; return this; }
        public ScanResultBuilder url(String val) { result.url = val; return this; }
        public ScanResultBuilder riskScore(Double val) { result.riskScore = val; return this; }
        public ScanResultBuilder classification(String val) { result.classification = val; return this; }
        public ScanResultBuilder analysisDetails(String val) { result.analysisDetails = val; return this; }
        public ScanResult build() { return result; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }
    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
    public String getAnalysisDetails() { return analysisDetails; }
    public void setAnalysisDetails(String analysisDetails) { this.analysisDetails = analysisDetails; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
