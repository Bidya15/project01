package com.phishingdetector.service;

import com.phishingdetector.integration.MLInferenceClient;
import com.phishingdetector.model.ScanResult;
import com.phishingdetector.model.User;
import com.phishingdetector.repository.ScanResultRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class URLScanService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(URLScanService.class);

    @Autowired
    private URLAnalysisService heuristicService;

    @Autowired
    private ThreatIntelService threatIntelService;

    @Autowired
    private RiskScoringService riskScoringService;

    @Autowired
    private MLInferenceClient mlClient;

    @Autowired
    private DomainSimilarityService similarityService;

    @Autowired
    private InfrastructureAnalysisService infrastructureService;

    @Autowired
    private ScanResultRepository scanResultRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Performs a high-performance deep scan using parallel intelligence gathering.
     */
    public ScanResult scanURL(String url, User user) {
        log.info("Starting Senior-grade security analysis for: {}", url);
        long startTime = System.currentTimeMillis();

        try {
            String domain = extractDomain(url);

            // 1. Parallel Intelligence Gathering
            CompletableFuture<List<String>> heuristicFuture = CompletableFuture.supplyAsync(() -> heuristicService.analyzeHeuristics(url));
            CompletableFuture<Map<String, Object>> domainIntelFuture = CompletableFuture.supplyAsync(() -> heuristicService.analyzeDomainIntelligence(url));
            CompletableFuture<Map<String, Boolean>> threatIntelFuture = CompletableFuture.supplyAsync(() -> threatIntelService.checkExternalAPIs(url));
            CompletableFuture<Map<String, Object>> mlFuture = CompletableFuture.supplyAsync(() -> fetchMLPrediction(url));
            CompletableFuture<Map<String, Object>> similarityFuture = CompletableFuture.supplyAsync(() -> similarityService.checkSimilarity(domain));
            CompletableFuture<Map<String, Object>> infraFuture = CompletableFuture.supplyAsync(() -> infrastructureService.analyzeInfrastructure(domain));

            // Wait for all intelligence nodes to respond
            CompletableFuture.allOf(heuristicFuture, domainIntelFuture, threatIntelFuture, mlFuture, similarityFuture, infraFuture).join();

            List<String> heuristics = heuristicFuture.get();
            Map<String, Object> domainIntel = domainIntelFuture.get();
            Map<String, Boolean> threatIntel = threatIntelFuture.get();
            Map<String, Object> mlResult = mlFuture.get();
            Map<String, Object> similarity = similarityFuture.get();
            Map<String, Object> infra = infraFuture.get();

            // 2. Multi-Factor Risk Calculation
            Object p = mlResult.get("phishing_probability");
            double mlProb = p instanceof Number ? ((Number) p).doubleValue() : 0.0;
            double simScore = (double) similarity.get("similarityScore");
            boolean isCampaign = (boolean) infra.getOrDefault("isCampaign", false);

            double rawScore = riskScoringService.calculateScore(heuristics, threatIntel, mlProb, simScore, isCampaign);
            
            // Adjust based on domain reputation / SSL
            if (Boolean.FALSE.equals(domainIntel.get("dns_valid"))) rawScore = Math.max(rawScore, 0.95);
            if (Boolean.FALSE.equals(domainIntel.get("ssl_valid")) && mlProb > 0.4) rawScore = Math.max(rawScore, 0.7);

            String classification = riskScoringService.getClassification(rawScore);
            
            // 3. Serialization of details & Explanations (Explainable AI)
            Map<String, Object> detailsMap = new HashMap<>();
            
            // Merge all indicators for frontend to display
            if (similarity.containsKey("indicator")) heuristics.add((String) similarity.get("indicator"));
            if (infra.containsKey("indicator")) heuristics.add((String) infra.get("indicator"));
            
            // Integrate ML indicators
            if (mlResult.get("indicators") instanceof List) {
                List<String> mlIndicators = (List<String>) mlResult.get("indicators");
                heuristics.addAll(mlIndicators);
            }
            
            detailsMap.put("heuristics", heuristics);
            detailsMap.put("threatIntel", threatIntel);
            detailsMap.put("domainIntel", domainIntel);
            detailsMap.put("mlResult", mlResult);
            detailsMap.put("similarity", similarity);
            detailsMap.put("infrastructure", infra);
            detailsMap.put("analysis_ms", System.currentTimeMillis() - startTime);
            
            String analysisDetails = objectMapper.writeValueAsString(detailsMap);

            // 4. Persistence & Auditing
            ScanResult result = new ScanResult();
            result.setUrl(url);
            result.setUser(user);
            result.setRiskScore(rawScore * 100);
            result.setClassification(classification);
            result.setAnalysisDetails(analysisDetails);
            result.setCreatedAt(LocalDateTime.now());

            ScanResult saved = scanResultRepository.save(result);

            if (user != null) {
                auditLogService.log(user, "SECURITY_SCAN", 
                    String.format("Full multi-layer scan completed for %s. Result: %s (Risk: %.2f%%)", url, classification, rawScore * 100), 
                    "INTERNAL_NODE");
            }

            log.info("Analysis concluded for {}. Classification: {} in {}ms", url, classification, System.currentTimeMillis() - startTime);
            return saved;

        } catch (Exception e) {
            log.error("Senior Rewrite Failure: Critical exception in scan engine for {}", url, e);
            throw new RuntimeException("Security analysis engine failure: " + e.getMessage());
        }
    }

    private String extractDomain(String url) {
        try {
            String domain = url.replaceFirst("^(https?://)?(www\\.)?", "");
            int slashIndex = domain.indexOf('/');
            if (slashIndex > 0) {
                domain = domain.substring(0, slashIndex);
            }
            return domain.toLowerCase();
        } catch (Exception e) {
            return url;
        }
    }

    private Map<String, Object> fetchMLPrediction(String url) {
        try {
            return mlClient.getPrediction(url).block();
        } catch (Exception e) {
            log.warn("Secondary Indicator (ML) unavailable for {}: {}", url, e.getMessage());
            return new HashMap<>();
        }
    }
}
