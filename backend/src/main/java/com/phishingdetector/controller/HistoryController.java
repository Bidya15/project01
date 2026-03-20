package com.phishingdetector.controller;

import com.phishingdetector.model.ScanResult;
import com.phishingdetector.model.User;
import com.phishingdetector.repository.ScanResultRepository;
import com.phishingdetector.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/history")
public class HistoryController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(HistoryController.class);

    @Autowired
    private ScanResultRepository scanResultRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/my-scans")
    public ResponseEntity<?> getMyScans(@AuthenticationPrincipal UserDetails userDetails) {
        log.debug("Fetching scan history for user: {}", userDetails.getUsername());
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) {
            log.error("Authenticated user not found in database: {}", userDetails.getUsername());
            return ResponseEntity.badRequest().body("User not found");
        }
        
        List<ScanResult> scans = scanResultRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(scans);
    }
}
