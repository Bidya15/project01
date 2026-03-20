package com.phishingdetector.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // ROLE_USER, ROLE_ADMIN

    private String plan = "LITE"; // LITE, PROFESSIONAL, SOVEREIGN

    private String apiKey;
    
    private Long monthlyScanLimit = 500L;

    @Column(nullable = true, columnDefinition = "boolean default false")
    private Boolean enabled = false;

    private LocalDateTime createdAt;

    public User() {}

    public User(String username, String fullName, String email, String password, String role) {
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Manual Builder to avoid breaking callers
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private User user = new User();
        public UserBuilder username(String val) { user.username = val; return this; }
        public UserBuilder fullName(String val) { user.fullName = val; return this; }
        public UserBuilder email(String val) { user.email = val; return this; }
        public UserBuilder password(String val) { user.password = val; return this; }
        public UserBuilder role(String val) { user.role = val; return this; }
        public UserBuilder plan(String val) { user.plan = val; return this; }
        public UserBuilder apiKey(String val) { user.apiKey = val; return this; }
        public UserBuilder monthlyScanLimit(Long val) { user.monthlyScanLimit = val; return this; }
        public UserBuilder enabled(boolean val) { user.enabled = val; return this; }
        public User build() { return user; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }
    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }
    public Long getMonthlyScanLimit() { return monthlyScanLimit; }
    public void setMonthlyScanLimit(Long monthlyScanLimit) { this.monthlyScanLimit = monthlyScanLimit; }
    public boolean isEnabled() { return enabled != null && enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
