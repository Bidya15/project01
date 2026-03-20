package com.phishingdetector.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String username;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    private Integer rating;
    private String category;

    @Column(columnDefinition = "boolean default false")
    private Boolean featured = false;

    private LocalDateTime createdAt;

    public Feedback() {}

    public Feedback(String fullName, String email, String username, String message) {
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.message = message;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Boolean isFeatured() { return featured != null && featured; }
    public void setFeatured(Boolean featured) { this.featured = featured != null && featured; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
