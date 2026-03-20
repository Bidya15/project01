package com.phishingdetector.controller;

import com.phishingdetector.dto.MessageResponse;
import com.phishingdetector.dto.ReportRequest;
import com.phishingdetector.model.User;
import com.phishingdetector.repository.UserRepository;
import com.phishingdetector.service.CommunityReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Community-driven threat intelligence endpoint.
 */
@RestController
@RequestMapping("/api/reports")
public class CommunityReportController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CommunityReportController.class);

    @Autowired
    private CommunityReportService reportService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/submit")
    public ResponseEntity<MessageResponse> submitReport(
            @RequestBody ReportRequest reportRequest, 
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String domain = reportRequest.getDomain();
        log.info("Community report received for domain: {}", domain);

        if (domain == null || domain.isBlank()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Valid domain is required for reporting."));
        }

        try {
            User reporter = (userDetails != null) 
                ? userRepository.findByUsername(userDetails.getUsername()).orElse(null) 
                : null;
                
            reportService.reportDomain(domain, reportRequest.getClassification(), reportRequest.getNotes(), reporter);
            return ResponseEntity.ok(new MessageResponse("Threat report successfully ingested into the global database."));
            
        } catch (DataIntegrityViolationException e) {
            log.info("Duplicate threat report detected for: {}", domain);
            return ResponseEntity.ok(new MessageResponse("Domain is already cataloged in our threat database. We appreciate your contribution!"));
        } catch (Exception e) {
            log.error("Failed to process community report for {}: {}", domain, e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Stellar processing error. Please try again later."));
        }
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/verify")
    public ResponseEntity<MessageResponse> verifyReport(@PathVariable Long id) {
        try {
            reportService.verifyReport(id);
            return ResponseEntity.ok(new MessageResponse("Report verified and promoted to global blacklist."));
        } catch (Exception e) {
            log.error("Failed to verify report {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Verification failed."));
        }
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteReport(@PathVariable Long id) {
        try {
            reportService.deleteReport(id);
            return ResponseEntity.ok(new MessageResponse("Threat report rejected and removed from system."));
        } catch (Exception e) {
            log.error("Failed to delete report {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Deletion failed."));
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentReports() {
        return ResponseEntity.ok(reportService.getRecentReports());
    }
}
