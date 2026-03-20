package com.phishingdetector.controller;

import com.phishingdetector.model.Feedback;
import com.phishingdetector.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FeedbackController.class);

    @Autowired
    private FeedbackRepository feedbackRepository;

    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody Feedback feedback) {
        log.info("Feedback received from: {}", feedback.getEmail());
        
        if (feedback.getFullName() == null || feedback.getFullName().isBlank() ||
            feedback.getEmail() == null || feedback.getEmail().isBlank() ||
            feedback.getMessage() == null || feedback.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields are required."));
        }

        try {
            feedbackRepository.save(feedback);
            return ResponseEntity.ok(Map.of("message", "Message received. Our experts will contact you shortly."));
        } catch (Exception e) {
            log.error("Failed to save feedback: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to process message. Please try again later."));
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicFeedback() {
        List<Feedback> featured = feedbackRepository.findByFeaturedTrue();
        List<Feedback> source = featured.isEmpty() ? feedbackRepository.findAll() : featured;
        return ResponseEntity.ok(source.stream()
            .map(f -> Map.of(
                "fullName", f.getFullName(),
                "message", f.getMessage(),
                "rating", f.getRating() != null ? f.getRating() : 5,
                "createdAt", f.getCreatedAt()
            ))
            .limit(6)
            .toList());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/feature")
    public ResponseEntity<?> toggleFeatured(@PathVariable Long id) {
        return feedbackRepository.findById(id).map(f -> {
            f.setFeatured(!f.isFeatured());
            feedbackRepository.save(f);
            String state = f.isFeatured() ? "Featured on homepage" : "Removed from homepage";
            log.info("Feedback {} featured state changed to {}", id, f.isFeatured());
            return ResponseEntity.ok(Map.of("message", state, "featured", f.isFeatured()));
        }).orElse(ResponseEntity.notFound().build());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllFeedback() {
        return ResponseEntity.ok(feedbackRepository.findAll());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Inquiry purged from system."));
        } catch (Exception e) {
            log.error("Failed to delete feedback {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Deletion protocol failure."));
        }
    }
}
