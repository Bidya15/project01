package com.phishingdetector.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_usage")
public class UserUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User user;

    private String currentMonth; // Format: YYYY-MM
    
    private Long scanCount = 0L;

    private LocalDateTime updatedAt;

    public UserUsage() {}

    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getCurrentMonth() { return currentMonth; }
    public void setCurrentMonth(String currentMonth) { this.currentMonth = currentMonth; }
    public Long getScanCount() { return scanCount; }
    public void setScanCount(Long scanCount) { this.scanCount = scanCount; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
