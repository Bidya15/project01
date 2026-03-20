package com.phishingdetector.service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class DomainSimilarityService {

    private static final List<String> TOP_DOMAINS = List.of(
        "google.com", "facebook.com", "microsoft.com", "apple.com", "amazon.com",
        "netflix.com", "paypal.com", "chase.com", "wellsfargo.com", "bankofamerica.com",
        "twitter.com", "instagram.com", "linkedin.com", "binance.com", "coinbase.com",
        "icloud.com", "outlook.com", "gmail.com", "yahoo.com"
    );

    public Map<String, Object> checkSimilarity(String targetDomain) {
        Map<String, Object> result = new HashMap<>();
        String bestMatch = null;
        double maxSimilarity = 0.0;

        for (String legitimateDomain : TOP_DOMAINS) {
            if (targetDomain.equals(legitimateDomain)) continue;

            double similarity = calculateSimilarity(targetDomain, legitimateDomain);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                bestMatch = legitimateDomain;
            }
        }

        result.put("isSimilar", maxSimilarity > 0.8);
        result.put("bestMatch", bestMatch);
        result.put("similarityScore", maxSimilarity);
        
        if (maxSimilarity > 0.8) {
            result.put("indicator", "Highly similar to legitimate domain: " + bestMatch + " (" + (int)(maxSimilarity * 100) + "% match)");
        }

        return result;
    }

    private double calculateSimilarity(String s1, String s2) {
        int distance = levenshteinDistance(s1, s2);
        int longest = Math.max(s1.length(), s2.length());
        if (longest == 0) return 1.0;
        return 1.0 - ((double) distance / longest);
    }

    private int levenshteinDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) {
            int lastValue = i;
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) costs[j] = j;
                else if (j > 0) {
                    int newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0) costs[s2.length()] = lastValue;
        }
        return costs[s2.length()];
    }
}
