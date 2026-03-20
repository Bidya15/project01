package com.phishingdetector.controller;

import com.phishingdetector.dto.ScanRequest;
import com.phishingdetector.model.ScanResult;
import com.phishingdetector.model.User;
import com.phishingdetector.repository.UserRepository;
import com.phishingdetector.service.URLScanService;
import com.phishingdetector.service.PreviewService;
import reactor.core.publisher.Mono;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * High-performance URL analysis entry point.
 * Managed by Senior Analysis Node.
 */
@RestController
@RequestMapping("/api/scanner")
public class URLScanController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(URLScanController.class);

    @Autowired
    private URLScanService scanService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PreviewService previewService;

    @PostMapping("/scan")
    public ResponseEntity<ScanResult> scanURL(
            @RequestBody ScanRequest scanRequest, 
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String username = userDetails != null ? userDetails.getUsername() : "ANONYMOUS";
        log.info("Security Scan Engine triggered for user: {} | Target: {}", username, scanRequest.getUrl());

        User user = (userDetails != null) 
            ? userRepository.findByUsername(username).orElse(null) 
            : null;

        try {
            ScanResult result = scanService.scanURL(scanRequest.getUrl(), user);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Fatal exception in Scan Engine for {}: {}", scanRequest.getUrl(), e.getMessage());
            throw e; 
        }
    }

    @GetMapping("/preview")
    public Mono<Map<String, Object>> getPreview(@RequestParam String url) {
        log.info("Sanitized preview request received for: {}", url);
        return previewService.getSafePreview(url);
    }
}
