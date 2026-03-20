package com.phishingdetector.controller;

import com.phishingdetector.model.User;
import com.phishingdetector.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReportedDomainRepository reportRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private ScanResultRepository scanResultRepository;
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private UserUsageRepository userUsageRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getGlobalStats() {
        log.info("Admin: Fetching global system metrics");
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalReports", reportRepository.count());
        stats.put("pendingReports", reportRepository.countByStatus("PENDING"));
        stats.put("totalFeedback", feedbackRepository.count());
        stats.put("totalScans", scanResultRepository.count());
        stats.put("activeAdmins", userRepository.findAll().stream().filter(u -> "ROLE_ADMIN".equals(u.getRole())).count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        log.info("Admin: Fetching user directory");
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        log.info("Admin: Approving account activation for user {}", id);
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User account activated successfully."));
    }

    @org.springframework.transaction.annotation.Transactional
    @DeleteMapping("/users/{id}/reject")
    public ResponseEntity<?> rejectUser(@PathVariable Long id) {
        log.info("Admin: Initiating Master Purge for user {}", id);
        User user = userRepository.findById(id).orElseThrow();
        
        // Primary Identity Protection
        if ("bidyasingrongpi90@gmail.com".equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot purge the Primary System Administrator."));
        }

        // Self-Action Protection
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (user.getUsername().equals(auth.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Security Violation: You cannot delete your own account."));
        }

        // --- Master Cascade: Manual Cleanup ---
        log.info("Purging associated data for user: {}", user.getUsername());
        scanResultRepository.deleteByUser(user);
        userUsageRepository.deleteByUser(user);
        reportRepository.deleteByReporter(user);
        auditLogRepository.deleteByUser(user);

        // Finally, remove the User record
        userRepository.delete(user);
        
        log.info("Master Purge complete for user {}", id);
        return ResponseEntity.ok(Map.of("message", "User account and all associated history have been purged."));
    }

    @PutMapping("/users/{id}/block")
    public ResponseEntity<?> blockUser(@PathVariable Long id) {
        log.info("Admin: Blocking user {}", id);
        User user = userRepository.findById(id).orElseThrow();

        // Primary Identity Protection
        if ("bidyasingrongpi90@gmail.com".equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot block the Primary System Administrator."));
        }

        // Self-Block Protection
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (user.getUsername().equals(auth.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Security Violation: You cannot block your own session."));
        }

        user.setEnabled(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User account has been blocked."));
    }

    @PutMapping("/users/{id}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable Long id) {
        log.info("Admin: Unblocking user {}", id);
        User user = userRepository.findById(id).orElseThrow();
        user.setEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User account has been unblocked."));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        log.info("Admin: Changing role of user {} to {}", id, newRole);
        User user = userRepository.findById(id).orElseThrow();

        // Primary Identity Protection
        if ("bidyasingrongpi90@gmail.com".equalsIgnoreCase(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot modify the Role of the Primary System Administrator."));
        }

        user.setRole(newRole);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User role updated to " + newRole));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        log.info("Admin: Fetching system audit history");
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/blacklist")
    public ResponseEntity<?> manualBlacklist(@RequestBody Map<String, String> request) {
        String domain = request.get("domain");
        log.info("Admin: Manual blacklist entry for domain: {}", domain);
        
        com.phishingdetector.model.ReportedDomain report = new com.phishingdetector.model.ReportedDomain();
        report.setDomain(domain);
        report.setStatus("VERIFIED");
        report.setCreatedAt(java.time.LocalDateTime.now());
        reportRepository.save(report);
        
        return ResponseEntity.ok(Map.of("message", "Domain added to high-priority blacklist."));
    }
}
