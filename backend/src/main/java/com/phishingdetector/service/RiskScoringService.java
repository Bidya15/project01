package com.phishingdetector.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

/**
 * Senior-grade risk assessment engine.
 * Uses a weighted multi-factor scoring algorithm.
 */
@Service
public class RiskScoringService {

    // Weight coefficients
    private static final double WEIGHT_THREAT_INTEL = 0.40;
    private static final double WEIGHT_ML_MODEL = 0.25;
    private static final double WEIGHT_HEURISTICS = 0.10;
    private static final double WEIGHT_SIMILARITY = 0.15;
    private static final double WEIGHT_INFRASTRUCTURE = 0.10;

    public double calculateScore(List<String> heuristics, Map<String, Boolean> threatIntel, double mlProb, double similarityScore, boolean isCampaign) {
        double weightedThreatIntel = calculateThreatIntelScore(threatIntel);
        double weightedML = mlProb * WEIGHT_ML_MODEL;
        double weightedHeuristics = Math.min(heuristics.size() * 0.03, WEIGHT_HEURISTICS);
        double weightedSimilarity = similarityScore * WEIGHT_SIMILARITY;
        double weightedInfra = isCampaign ? WEIGHT_INFRASTRUCTURE : 0.0;

        double finalScore = weightedThreatIntel + weightedML + weightedHeuristics + weightedSimilarity + weightedInfra;
        
        return Math.min(finalScore, 1.0);
    }

    private double calculateThreatIntelScore(Map<String, Boolean> intel) {
        double score = 0.0;
        
        // Critical Indicators
        if (Boolean.TRUE.equals(intel.get("googleSafeBrowsing"))) score += 0.40;
        
        // Secondary Indicators
        if (Boolean.TRUE.equals(intel.get("virusTotal"))) score += 0.25;
        if (Boolean.TRUE.equals(intel.get("phishTank"))) score += 0.15;

        return Math.min(score, WEIGHT_THREAT_INTEL);
    }
    
    public String getClassification(double score) {
        if (score >= 0.65) return "PHISHING";
        if (score >= 0.30) return "SUSPICIOUS";
        return "SAFE";
    }
}
