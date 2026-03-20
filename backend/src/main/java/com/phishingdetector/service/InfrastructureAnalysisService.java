package com.phishingdetector.service;

import com.phishingdetector.repository.ScanResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InfrastructureAnalysisService {

    @Autowired
    private ScanResultRepository scanResultRepository;

    public Map<String, Object> analyzeInfrastructure(String domain) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            InetAddress address = InetAddress.getByName(domain);
            String ip = address.getHostAddress();
            result.put("ip", ip);
            
            // In a real system, we'd also check ASN, hosting provider, etc.
            // For now, let's see if we've seen this IP before in other scans
            long sharedInfrastructureCount = scanResultRepository.findAll().stream()
                .filter(sr -> sr.getAnalysisDetails() != null && sr.getAnalysisDetails().contains(ip))
                .count();

            result.put("sharedInfrastructureCount", sharedInfrastructureCount);
            
            if (sharedInfrastructureCount > 5) {
                result.put("isCampaign", true);
                result.put("indicator", "Part of a detected phishing campaign infrastructure (Shared IP: " + ip + ")");
            } else {
                result.put("isCampaign", false);
            }

        } catch (Exception e) {
            result.put("error", "Infrastructure lookup failed: " + e.getMessage());
        }

        return result;
    }
}
