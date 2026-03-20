package com.phishingdetector.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reported_domains")
public class ReportedDomain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String domain;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User reporter;

    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED
    
    private String classification;
    
    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt;

    public ReportedDomain() {}

    public ReportedDomain(String domain, User reporter, String status) {
        this.domain = domain;
        this.reporter = reporter;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static ReportedDomainBuilder builder() {
        return new ReportedDomainBuilder();
    }

    public static class ReportedDomainBuilder {
        private ReportedDomain domainObj = new ReportedDomain();
        public ReportedDomainBuilder domain(String val) { domainObj.domain = val; return this; }
        public ReportedDomainBuilder reporter(User val) { domainObj.reporter = val; return this; }
        public ReportedDomainBuilder status(String val) { domainObj.status = val; return this; }
        public ReportedDomain build() { return domainObj; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }
    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
